import { ethers, network  } from "hardhat";
import { expect } from "chai";
import {
    EventLog,
} from "ethers";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
import hre from "hardhat";

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import type { Signers } from "./types";
import { padLeft } from 'web3-utils'
import { marshalString, unmarshalString } from './shared/marshal';
// import {deployGovernanceContractsFixture } from "./Goverance/Governance.fixture";
import {tonStakingV2ContractsFixture } from "./TallyDAO.upgradable.fixture";

import { tonStakingV2Config } from "../tostakingv2.sepolia.config"
import { config } from "../deploy.tokamak.tally.config"

/**
scenario 3.
    https://github.com/tokamak-network/ton-staking-tally-contract/issues/6
    Change the SeigManager's seigniorage distribution rate #6
*/

async function depositDepositManager (ton, daoSigner, depositManager, user, depositAmount) {
    await (await  ton.connect(daoSigner).mint(user.address, depositAmount)).wait()
    const depositManager_address = await depositManager.getAddress()
    // const depositAmount = 1100000000000000000000n

    console.log('depositDepositManager' , depositManager_address)
    console.log('tonStakingV2Config.LevelCandidate' , tonStakingV2Config.LevelCandidate)

    const data = marshalString(
        [depositManager_address, tonStakingV2Config.LevelCandidate]
        .map(unmarshalString)
        .map(str => padLeft(str, 64))
        .join(''),
    );

    const receipt1 = await (await ton.connect(user).approveAndCall(
        tonStakingV2Config.WTON,
        depositAmount,
        data
    )).wait()

    expect(receipt1).to.emit(depositManager, "Deposited");
}

async function viewDistributionRates (seigManager) {

    const seigManager_address = await seigManager.getAddress()
    let powerTONSeigRate = await seigManager.powerTONSeigRate()
    let daoSeigRate = await seigManager.daoSeigRate()
    let relativeSeigRate = await seigManager.relativeSeigRate()

    console.log("==================");
    console.log("powerTONSeigRate : ", powerTONSeigRate);
    console.log("daoSeigRate      : ", daoSeigRate);
    console.log("relativeSeigRate : ", relativeSeigRate);

}

describe("TokamakGovernor : the 3rd scenario", async function () {
    before(async function () {
        this.signers = {} as Signers;

        const signers = await ethers.getSigners();

        this.deployer  = signers[0];
        this.signers.admin = signers[1];
        this.signers.notAuthorized = signers[2];

        this.aUser  = signers[3];
        this.bUser  = signers[4];

        this.loadFixture = loadFixture;

        // console.log("Voting is applied based on the voting amount of the block snapshot with a voting delay applied. ")
    });

    beforeEach(async function () {

        const {tokamaktoken, timelock, governor, depositManager,
                seigManagerProxy, seigManager, seigManagerV1_Vote,
                dao, ton, tos, stakingHolder
            } = await this.loadFixture(tonStakingV2ContractsFixture);

        const daoAddress = await dao.getAddress()

        this.proposalId ;

        this.governor = governor;
        this.tokamaktoken = tokamaktoken;
        this.timelock = timelock;

        this.depositManager = depositManager;
        this.seigManagerProxy = seigManagerProxy;
        this.seigManager = seigManager;
        this.seigManagerV1_Vote = seigManagerV1_Vote;

        this.dao = dao;
        this.ton = ton;
        this.tos = tos;
        this.stakingHolder = stakingHolder;

        await network.provider.send("hardhat_impersonateAccount", [ daoAddress, ]);
        await network.provider.send("hardhat_setBalance", [ daoAddress,  "0x10000000000000000000000000", ]);

        this.daoSigner = await ethers.getSigner(daoAddress);

        //===============================
        // agenda : change the seigManager's seigniorage rate
        // const calldata1 = this.seigManager.interface.encodeFunctionData("setPowerTONSeigRate", [0n]);
        // const calldata2 = this.seigManager.interface.encodeFunctionData("setPseigRate", [500000000000000000000000000n])

        const calldata1 = this.seigManager.interface.encodeFunctionData("setPseigRate", [400000000000000000000000000n]);
        const calldata2 = this.seigManager.interface.encodeFunctionData("setPowerTONSeigRate", [100000000000000000000000000n]);

        //===============================

        const seigManagerAddress = await this.seigManagerProxy.getAddress()
        this.proposalInfo = {
            targets: [seigManagerAddress, seigManagerAddress],
            value: [0n,0n],
            calldata:  [calldata1, calldata2],
            description: "Proposal to change the seigniorage distribution rate: powerTONRate is 0% and relativeSeigRate adds 1%"
        }
    });

    beforeEach(async function () {

        const { tokamaktoken, governor, signers, timelock } = this;

        console.log('seigManagerProxy', await this.seigManagerProxy.getAddress())
        expect(await this.seigManagerProxy.isAdmin(this.daoSigner.address)).to.be.true;

        // ---- for agenda
        // const seigManagerAddress = await this.seigManagerProxy.getAddress()
        const timelock_address = await timelock.getAddress();
        let receipt = await (await this.seigManagerProxy.connect(this.daoSigner).addAdmin(timelock_address)).wait()

        const eventLogs: EventLog[] = (receipt?.logs ?? []).filter((log): log is EventLog => true);
        const event = eventLogs.find((log) => log.fragment.name === "RoleGranted");

        const logDescription = this.seigManagerProxy.interface.parseLog({
            topics: event?.topics ? [...event.topics] : [],
            data: event?.data ?? "",
        });

        expect(logDescription?.args["account"]).to.be.eq(timelock_address)

    })

    it("Change the seigniorage distribution rate: powerTONRate is 0% and relativeSeigRate adds 1%", async function () {
        // console.log("Change the seigniorage distribution rate: powerTONRate is 0% and relativeSeigRate adds 1%")

        await viewDistributionRates (this.seigManagerProxy)

        const depositAmount1000 = 1100000000000000000000n

        console.log('this.depositManager', await this.depositManager.getAddress())
        // =======================================
        // 1. aUser and bUser stake ton.
        await depositDepositManager (this.ton, this.daoSigner, this.depositManager, this.aUser, depositAmount1000)
        await depositDepositManager (this.ton, this.daoSigner, this.depositManager, this.bUser, depositAmount1000)

        // =======================================
        // 2. aUser and bUser mint tokamaktoken with their staked ton.
        // tokamaktoken: a token with voting rights
        const { tokamaktoken, governor, signers, timelock } = this;
        const amount_200 = BigInt("2"+"0".repeat(20))
        const amount_800 = BigInt("8"+"0".repeat(20))
        await (await tokamaktoken.connect(this.aUser).mint(amount_200)).wait()
        await (await tokamaktoken.connect(this.bUser).mint(amount_800)).wait()

        // =======================================
        // 3. aUser and bUser delegate to themselves with tokamaktoken.
        // delegate - Delegates votes from the sender to `delegatee`.
        await tokamaktoken.connect(this.aUser).delegate(this.aUser.address);
        await tokamaktoken.connect(this.bUser).delegate(this.bUser.address);

        // =======================================
        // 4. aUser submits a proposal to change the seigniorage distribution ratio.
        // Propose
        const proposalTx = await governor.connect(this.aUser).propose(
            this.proposalInfo.targets, // targets
            this.proposalInfo.value, // value
            this.proposalInfo.calldata,
            this.proposalInfo.description// description
        );

        expect(proposalTx).to.emit(governor, "ProposalCreated");

        // Wait for the transaction to be mined
        const receipt = await proposalTx.wait(1);
        const eventLogs: EventLog[] = (receipt?.logs ?? []).filter((log): log is EventLog => true);

        // Find the ProposalCreated event in the transaction receipt
        const event = eventLogs.find((log) => log.fragment.name === "ProposalCreated");

        const logDescription = governor.interface.parseLog({
            topics: event?.topics ? [...event.topics] : [],
            data: event?.data ?? "",
        });

        // Get the proposalId from the event arguments
        this.proposalId = logDescription?.args["proposalId"]
        expect(logDescription?.args["description"]).to.be.eq(this.proposalInfo.description)

        // await tokamaktoken.connect(this.bUser).delegate(this.aUser.address);
        // let clock1  = await governor.clock();

        // =======================================
        // 5. The votingDelay must have passed in order to vote.
        const numberOfBlocks = Number(await governor.votingDelay()) + 1;
        await mine(numberOfBlocks);


        // =======================================
        // 6. aUser and bUser vote.
        // options 0 = Against, 1 = For, 2 = Abstain
        // Vote: A for,
        await expect( governor.connect(this.aUser).castVote(this.proposalId, 1)).to.emit(governor, "VoteCast");

        // // Change of delegation after delegated user voted
        // await tokamaktoken.connect(this.bUser).delegate(this.bUser.address);

        // Vote: B against
        await expect( governor.connect(this.bUser).castVote(this.proposalId, 2)).to.emit(governor, "VoteCast");

        await mine(Number(await governor.votingPeriod()) + 1);

        // let clock2  = await governor.clock();
        await mine(1);

        // await tokamaktoken.connect(this.bUser).delegate(this.bUser.address);

        // let clock3  = await governor.clock();
        // await mine(1);

        // =======================================
        // 7. Queue proposal after votingPeriod has passed.
        // expect proposal state to be succeeded
        let proposalState = await governor.state(this.proposalId);
        expect(proposalState).to.be.equal(4);

        // Queue proposal
        await expect( governor.queue(
        this.proposalInfo.targets,
        this.proposalInfo.value,
        this.proposalInfo.calldata,
            ethers.keccak256(ethers.toUtf8Bytes(this.proposalInfo.description))
        )).to.emit(governor, "ProposalQueued");

        // expect proposal state to be queued
        proposalState = await governor.state(this.proposalId);
        expect(proposalState).to.be.equal(5);

        // =======================================
        // 8. Execute proposal after After the minDelay of timelock has elapsed.
        // Simulate time delay required before execution
        await mine(config.timelock.minDelay +1);

        // Execute proposal
        await expect( governor.connect(signers.notAuthorized).execute(
            this.proposalInfo.targets,
            this.proposalInfo.value,
            this.proposalInfo.calldata,
            ethers.keccak256(ethers.toUtf8Bytes(this.proposalInfo.description))
        )).to.emit(governor, "ProposalExecuted");

        // expect proposal state to be executed
        proposalState = await governor.state(this.proposalId);
        expect(proposalState).to.be.equal(7);

        // =======================================
        // 9. result of executing the agenda.
        await viewDistributionRates (this.seigManagerProxy)

    }).timeout(100000000);

});