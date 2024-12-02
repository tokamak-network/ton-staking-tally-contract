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
import {DaoTallyContractsFixture } from "./TallyDAO.upgradable.fixture";

import { tonStakingV2Config } from "../tostakingv2.sepolia.config"
import { config } from "../deploy.tokamak.tally.config"

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

describe("Security Council Test", async function () {
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

        const { securityCouncil, tokamaktoken, timelock, governor, depositManager,
            seigManagerProxy, seigManager, seigManagerV1_Vote,
            dao, ton, tos, stakingHolder, daoProxy, securityCouncilSigner
        } = await this.loadFixture(DaoTallyContractsFixture);

        const daoAddress = await dao.getAddress()

        this.proposalId ;
        this.queueId ;
        this.queueRelay ;

        this.securityCouncil = securityCouncil;

        this.tokamaktoken = tokamaktoken;
        this.timelock = timelock;
        this.governor = governor;

        this.depositManager = depositManager;
        this.seigManagerProxy = seigManagerProxy;
        this.seigManager = seigManager;
        this.seigManagerV1_Vote = seigManagerV1_Vote;

        this.dao = dao;
        this.ton = ton;
        this.tos = tos;
        this.stakingHolder = stakingHolder;

        this.daoProxy = daoProxy
        await network.provider.send("hardhat_impersonateAccount", [ daoAddress, ]);
        await network.provider.send("hardhat_setBalance", [ daoAddress,  "0x10000000000000000000000000", ]);

        this.daoSigner = await ethers.getSigner(daoAddress);
        this.securityCouncilSigner = securityCouncilSigner
    });

    // it("DAO: GrantRole to TokamakTimelock and SecurityCouncil", async function () {
    //     const { securityCouncil, tokamaktoken, governor, signers, timelock } = this;

    //     console.log('seigManagerProxy', await this.seigManagerProxy.getAddress())
    //     const timelock_address = await timelock.getAddress()
    //     const securityCouncil_address = await securityCouncil.getAddress()
    //     console.log('securityCouncil', securityCouncil_address)
    //     console.log('timelock', timelock_address)
    //     expect(await this.seigManagerProxy.isAdmin(this.daoSigner.address)).to.be.true;
    //     expect(await this.seigManagerProxy.isAdmin(timelock_address)).to.be.true;

    //     expect(await this.depositManager.isAdmin(this.daoSigner.address)).to.be.true;

    //     await (await this.depositManager.connect(this.daoSigner).addAdmin(timelock_address)).wait()
    //     expect(await this.depositManager.isAdmin(timelock_address)).to.be.true;

    //     const DEFAULT_ADMIN_ROLE = await this.daoProxy.DEFAULT_ADMIN_ROLE()
    //     await (await this.daoProxy.connect(this.daoSigner).grantRole(DEFAULT_ADMIN_ROLE,
    //         timelock_address)).wait()
    //     await (await this.daoProxy.connect(this.daoSigner).grantRole(DEFAULT_ADMIN_ROLE,
    //         securityCouncil_address)).wait()

    //     expect(await this.daoProxy.hasRole(DEFAULT_ADMIN_ROLE, timelock_address)).to.be.true;
    //     expect(await this.daoProxy.hasRole(DEFAULT_ADMIN_ROLE, securityCouncil_address)).to.be.true;

    // })

    it("Make Proposal ", async function () {
        //===============================
        // agenda : change the seigManager's seigniorage rate
        // const calldata1 = this.seigManager.interface.encodeFunctionData("setPowerTONSeigRate", [0n]);
        // const calldata2 = this.seigManager.interface.encodeFunctionData("setPseigRate", [500000000000000000000000000n])

        const calldata1 = this.seigManager.interface.encodeFunctionData("setPseigRate", [400000000000000000000000000n]);
        const calldata2 = this.seigManager.interface.encodeFunctionData("setPowerTONSeigRate", [100000000000000000000000000n]);
        const seigManagerAddress = await this.seigManagerProxy.getAddress()
        this.proposalInfo = {
            targets: [seigManagerAddress, seigManagerAddress],
            value: [0n,0n],
            calldata:  [calldata1, calldata2],
            description: "Proposal to change the seigniorage distribution rate: powerTONRate is 0% and relativeSeigRate adds 1%"
        }
    })

    it("Submit Proposal to TokamakGovernor", async function () {
        await viewDistributionRates (this.seigManagerProxy)
        const depositAmount1000 = 1100000000000000000000n
        // =======================================
        // 1. aUser and bUser stake ton.
        await depositDepositManager (this.ton, this.daoSigner, this.depositManager, this.aUser, depositAmount1000)
        await depositDepositManager (this.ton, this.daoSigner, this.depositManager, this.bUser, depositAmount1000)

        // =======================================
        // 2. aUser and bUser mint tokamaktoken with their staked ton.
        // tokamaktoken: a token with voting rights
        const { tokamaktoken, governor, signers, timelock } = this;
        const amount_200 = BigInt("1"+"0".repeat(20))
        const amount_800 = BigInt("2"+"0".repeat(20))
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
            this.proposalInfo.description // description
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

    }).timeout(100000000);

    it("Governor: The Security Council can't cancel the proposal before voting.", async function () {
        const { securityCouncilSigner, tokamaktoken, governor, signers, timelock } = this;

        await expect(governor.connect(securityCouncilSigner).cancel(
            this.proposalInfo.targets, // targets
            this.proposalInfo.value, // value
            this.proposalInfo.calldata,
            ethers.keccak256(ethers.toUtf8Bytes(this.proposalInfo.description)) // description
        )).to.be.reverted;
    })

    it("Starting Voting ", async function () {
        const { tokamaktoken, governor, signers, timelock } = this;
        // =======================================
        // 5. The votingDelay must have passed in order to vote.
        const numberOfBlocks = Number(await governor.votingDelay()) + 1;
        await mine(numberOfBlocks);

         // =======================================
        // 6. aUser and bUser vote.
        // options 0 = Against, 1 = For, 2 = Abstain
        // Vote: A for,
        const voteTx = await governor.connect(this.aUser).castVote(this.proposalId, 1)
        expect(voteTx).to.emit(governor, "VoteCast");

        // Wait for the transaction to be mined
        const receipt = await voteTx.wait(1);
        const eventLogs: EventLog[] = (receipt?.logs ?? []).filter((log): log is EventLog => true);

        // Find the ProposalCreated event in the transaction receipt
        const event = eventLogs.find((log) => log.fragment.name === "VoteCast");

        const logDescription = governor.interface.parseLog({
            topics: event?.topics ? [...event.topics] : [],
            data: event?.data ?? "",
        });

        expect(logDescription?.args["voter"]).to.be.eq(this.aUser.address)
        expect(logDescription?.args["proposalId"]).to.be.eq(this.proposalId)

    })

    it("Governor: The Security Council can't cancel the proposal during voting.", async function () {
        const { securityCouncilSigner, tokamaktoken, governor, signers, timelock } = this;

        await expect(governor.connect(securityCouncilSigner).cancel(
            this.proposalInfo.targets, // targets
            this.proposalInfo.value, // value
            this.proposalInfo.calldata,
            ethers.keccak256(ethers.toUtf8Bytes(this.proposalInfo.description)) // description
        )).to.be.reverted;
    })

    it("End Voting ", async function () {
        const { tokamaktoken, governor, signers, timelock } = this;

        // Vote: B against
        await expect(governor.connect(this.bUser).castVote(this.proposalId, 2)).to.emit(governor, "VoteCast");
        await mine(Number(await governor.votingPeriod()) + 1);

    })

    it("Governor: The Security Council can't cancel the proposal after voting.", async function () {
        const { securityCouncilSigner, tokamaktoken, governor, signers, timelock } = this;

        await expect(governor.connect(securityCouncilSigner).cancel(
            this.proposalInfo.targets, // targets
            this.proposalInfo.value, // value
            this.proposalInfo.calldata,
            ethers.keccak256(ethers.toUtf8Bytes(this.proposalInfo.description)) // description
        )).to.be.reverted;
    })

    it("Start Queuing ", async function () {
        const { tokamaktoken, governor, signers, timelock } = this;

        // =======================================
        // 7. Queue proposal after votingPeriod has passed.
        // expect proposal state to be succeeded
        let proposalState = await governor.state(this.proposalId);
        expect(proposalState).to.be.equal(4);

        // Queue
        const queueTx = await governor.connect(this.aUser).queue(
            this.proposalInfo.targets,
            this.proposalInfo.value,
            this.proposalInfo.calldata,
            ethers.keccak256(ethers.toUtf8Bytes(this.proposalInfo.description))
        )
        expect(queueTx).to.emit(governor, "ProposalQueued");

        // Wait for the transaction to be mined
        const receipt1 = await queueTx.wait();

        const events = await governor.queryFilter(governor.filters.ProposalQueued(), -1);
        for (const event of events.filter(e => e.transactionHash == receipt1.hash)) {
            const { proposalId, etaSeconds } = event.args;
            expect(this.proposalId).to.be.eq(proposalId)
        }
        //--
        const eventsCallScheduled = await timelock.queryFilter(timelock.filters.CallScheduled(), -1);
        for (const event of eventsCallScheduled.filter(e => e.transactionHash == receipt1.hash)) {
            const { id, index, target, values, data, predecessor, delay } = event.args;
            this.queueId = id
            this.queueRelay = delay
            break;
        }

        // expect proposal state to be queued
        proposalState = await governor.state(this.proposalId);
        expect(proposalState).to.be.equal(5);



    })

    // it("Timelock: The Security Council can cancel the proposal during queue pending (waiting or ready).", async function () {
    //     const { securityCouncilSigner, tokamaktoken, governor, signers, timelock } = this;

    //     // expect queue state to be waiting
    //     const operationStatus = await timelock.getOperationState(this.queueId)
    //     expect(operationStatus).to.be.equal(1);
    //     expect(await timelock.isOperationPending(this.queueId)).to.be.equal(true);

    //     await timelock.connect(securityCouncilSigner).cancel(this.queueId)
    // })

    it("End Queuing ", async function () {
        const { tokamaktoken, governor, signers, timelock } = this;
        // =======================================
        // 8. Execute proposal after After the minDelay of timelock has elapsed.
        // Simulate time delay required before execution
        await mine(config.timelock.minDelay +1);

    })

    it("Timelock: The Security Council can cancel the proposal during queue pending (waiting or ready).", async function () {
        const { securityCouncilSigner, tokamaktoken, governor, signers, timelock } = this;

        // expect queue state to be pending
        expect(await timelock.isOperationPending(this.queueId)).to.be.equal(true);

        await timelock.connect(securityCouncilSigner).cancel(this.queueId)
    })

    // it("Execute proposal", async function () {
    //     const { tokamaktoken, governor, signers, timelock } = this;

    //     // Execute proposal
    //     await expect( governor.connect(signers.notAuthorized).execute(
    //         this.proposalInfo.targets,
    //         this.proposalInfo.value,
    //         this.proposalInfo.calldata,
    //         ethers.keccak256(ethers.toUtf8Bytes(this.proposalInfo.description))
    //     )).to.emit(governor, "ProposalExecuted");

    //     // expect proposal state to be executed
    //     const proposalState = await governor.state(this.proposalId);
    //     expect(proposalState).to.be.equal(7);

    //     // =======================================
    //     // 9. result of executing the agenda.
    //     await viewDistributionRates (this.seigManagerProxy)
    // })

});