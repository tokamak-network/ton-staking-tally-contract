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
import {tonStakingV2ContractsFixture } from "./TonStakingV2.fixture";

import { tonStakingV2Config } from "../tostakingv2.config"
import { config } from "../deploy.tokamak.tally.config"

/**
scenario 2.
1. when a voter changes their delegation after delegated user voted
2. when a voter changes their delegation during voting
3. when a voter removes their delegation and vote themselves
*/


async function depositDepositManager (ton, daoSigner, depositManager, user, depositAmount) {
    await (await  ton.connect(daoSigner).mint(user.address, depositAmount)).wait()
    const depositManager_address = await depositManager.getAddress()
    // const depositAmount = 1100000000000000000000n

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

describe("TokamakGovernor : the 2nd scenario", async function () {
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
        // agenda : mint 1000 ton to admin
        const calldata = this.ton.interface.encodeFunctionData("mint", [this.signers.admin.address, 1000n]);
        //===============================

        this.proposalInfo = {
            targets: [await this.ton.getAddress()],
            value: [0n],
            calldata:  [calldata],
            description: "Proposal to mint 1000 tokens for admin"
        }
    });

    beforeEach(async function () {

        const { tokamaktoken, governor, signers, timelock } = this;
        expect(await this.ton.isMinter(this.daoSigner.address)).to.be.true;

        const timelock_address = await timelock.getAddress();
        let receipt = await (await this.ton.connect(this.daoSigner).addMinter(timelock_address)).wait()

        const eventLogs: EventLog[] = (receipt?.logs ?? []).filter((log): log is EventLog => true);
        const event = eventLogs.find((log) => log.fragment.name === "MinterAdded");

        const logDescription = this.ton.interface.parseLog({
            topics: event?.topics ? [...event.topics] : [],
            data: event?.data ?? "",
        });
        expect(logDescription?.args["account"]).to.be.eq(timelock_address)

    })

    it("1. when a voter changes their delegation after delegated user voted", async function () {
        // console.log("At the time of voting, the block must already be after a voting delay, so changing the delegation after voting has no impact.")

        const depositAmount1000 = 1100000000000000000000n

        await depositDepositManager (this.ton, this.daoSigner, this.depositManager, this.aUser, depositAmount1000)
        await depositDepositManager (this.ton, this.daoSigner, this.depositManager, this.bUser, depositAmount1000)

        const { tokamaktoken, governor, signers, timelock } = this;
        const amount_200 = BigInt("2"+"0".repeat(20))
        const amount_800 = BigInt("8"+"0".repeat(20))
        await (await tokamaktoken.connect(this.aUser).mint(amount_200)).wait()
        await (await tokamaktoken.connect(this.bUser).mint(amount_800)).wait()

        // delegate - Delegates votes from the sender to `delegatee`.
        await tokamaktoken.connect(this.aUser).delegate(this.aUser.address);
        await tokamaktoken.connect(this.bUser).delegate(this.bUser.address);


        let clock0  = await governor.clock();

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

        await tokamaktoken.connect(this.bUser).delegate(this.aUser.address);
        let clock1  = await governor.clock();

        //
        const numberOfBlocks = Number(await governor.votingDelay()) + 1;
        await mine(numberOfBlocks);

        // options 0 = Against, 1 = For, 2 = Abstain
        // Vote: A for,
        await expect( governor.connect(this.aUser).castVote(this.proposalId, 1)).to.emit(governor, "VoteCast");

        // Change of delegation after delegated user voted
        await tokamaktoken.connect(this.bUser).delegate(this.bUser.address);

        // Vote: B against
        await expect( governor.connect(this.bUser).castVote(this.proposalId, 2)).to.emit(governor, "VoteCast");

        await mine(Number(await governor.votingPeriod()) + 1);

        let clock2  = await governor.clock();
        await mine(1);

        await tokamaktoken.connect(this.bUser).delegate(this.bUser.address);

        let clock3  = await governor.clock();
        await mine(1);

        // getVotes
        // let getVotes_a = await governor.getVotes(this.aUser.address, clock0)
        // let getVotes_b = await governor.getVotes(this.bUser.address, clock0)

        // console.log('after delegating, getVotes_a ', getVotes_a)
        // console.log('after delegating, getVotes_b ', getVotes_b)

        // getVotes_a = await governor.getVotes(this.aUser.address, clock1)
        // getVotes_b = await governor.getVotes(this.bUser.address, clock1)

        // console.log('after changing delegate (b -> a), getVotes_a', getVotes_a)
        // console.log('after changing delegating, getVotes_b', getVotes_b)

        // getVotes_a = await governor.getVotes(this.aUser.address, clock2)
        // getVotes_b = await governor.getVotes(this.bUser.address, clock2)

        // console.log('after closing the voting period, getVotes_a ', getVotes_a)
        // console.log('after closing the voting period, getVotes_b ', getVotes_b)

        // getVotes_a = await governor.getVotes(this.aUser.address, clock3)
        // getVotes_b = await governor.getVotes(this.bUser.address, clock3)

        // console.log('after changing delegate (b -> b), getVotes_a ', getVotes_a)
        // console.log('after changing delegate, getVotes_b ', getVotes_b)

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

    })


    it("2. when a voter changes their delegation during voting", async function () {
        // console.log("During voting, the block must already be after a voting delay, so changing the delegation after voting has no impact.")

        const depositAmount1000 = 1100000000000000000000n

        await depositDepositManager (this.ton, this.daoSigner, this.depositManager, this.aUser, depositAmount1000)
        await depositDepositManager (this.ton, this.daoSigner, this.depositManager, this.bUser, depositAmount1000)

        const { tokamaktoken, governor, signers, timelock } = this;
        const amount_200 = BigInt("2"+"0".repeat(20))
        const amount_800 = BigInt("8"+"0".repeat(20))
        await (await tokamaktoken.connect(this.aUser).mint(amount_200)).wait()
        await (await tokamaktoken.connect(this.bUser).mint(amount_800)).wait()

        // delegate - Delegates votes from the sender to `delegatee`.
        await tokamaktoken.connect(this.aUser).delegate(this.aUser.address);
        await tokamaktoken.connect(this.bUser).delegate(this.bUser.address);


        let clock0  = await governor.clock();

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

        await tokamaktoken.connect(this.bUser).delegate(this.aUser.address);
        let clock1  = await governor.clock();

        //
        const numberOfBlocks = Number(await governor.votingDelay()) + 1;
        await mine(numberOfBlocks);

        // Change of delegation during voting period
        await tokamaktoken.connect(this.bUser).delegate(this.bUser.address);


        // options 0 = Against, 1 = For, 2 = Abstain
        // Vote: A for,
        await expect( governor.connect(this.aUser).castVote(this.proposalId, 1)).to.emit(governor, "VoteCast");

        // Vote: B against
        await expect( governor.connect(this.bUser).castVote(this.proposalId, 2)).to.emit(governor, "VoteCast");

        await mine(Number(await governor.votingPeriod()) + 1);

        let clock2  = await governor.clock();
        await mine(1);

        await tokamaktoken.connect(this.bUser).delegate(this.bUser.address);

        let clock3  = await governor.clock();
        await mine(1);

        // getVotes
        // let getVotes_a = await governor.getVotes(this.aUser.address, clock0)
        // let getVotes_b = await governor.getVotes(this.bUser.address, clock0)

        // console.log('after delegating, getVotes_a ', getVotes_a)
        // console.log('after delegating, getVotes_b ', getVotes_b)

        // getVotes_a = await governor.getVotes(this.aUser.address, clock1)
        // getVotes_b = await governor.getVotes(this.bUser.address, clock1)

        // console.log('after changing delegate (b -> a), getVotes_a', getVotes_a)
        // console.log('after changing delegating, getVotes_b', getVotes_b)

        // getVotes_a = await governor.getVotes(this.aUser.address, clock2)
        // getVotes_b = await governor.getVotes(this.bUser.address, clock2)

        // console.log('after closing the voting period, getVotes_a ', getVotes_a)
        // console.log('after closing the voting period, getVotes_b ', getVotes_b)

        // getVotes_a = await governor.getVotes(this.aUser.address, clock3)
        // getVotes_b = await governor.getVotes(this.bUser.address, clock3)

        // console.log('after changing delegate (b -> b), getVotes_a ', getVotes_a)
        // console.log('after changing delegate, getVotes_b ', getVotes_b)

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

    });

    it("3. when a voter removes their delegation and vote themselves", async function () {
        // console.log("Voting is based on the block snapshot with voting delay applied.")
        // console.log("Even when voting on your own, you delegate to yourself.")

        const depositAmount1000 = 1100000000000000000000n

        await depositDepositManager (this.ton, this.daoSigner, this.depositManager, this.aUser, depositAmount1000)
        await depositDepositManager (this.ton, this.daoSigner, this.depositManager, this.bUser, depositAmount1000)

        const { tokamaktoken, governor, signers, timelock } = this;
        const amount_200 = BigInt("2"+"0".repeat(20))
        const amount_800 = BigInt("8"+"0".repeat(20))
        await (await tokamaktoken.connect(this.aUser).mint(amount_200)).wait()
        await (await tokamaktoken.connect(this.bUser).mint(amount_800)).wait()

        // delegate - Delegates votes from the sender to `delegatee`.
        await tokamaktoken.connect(this.aUser).delegate(this.aUser.address);
        await tokamaktoken.connect(this.bUser).delegate(this.bUser.address);

        let clock0  = await governor.clock();

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

        await tokamaktoken.connect(this.bUser).delegate(this.aUser.address);

        await tokamaktoken.connect(this.bUser).burn(amount_200);

        let clock1  = await governor.clock();

        //
        const numberOfBlocks = Number(await governor.votingDelay()) + 1;
        await mine(numberOfBlocks);

        // options 0 = Against, 1 = For, 2 = Abstain
        // Vote: A for,
        await expect( governor.connect(this.aUser).castVote(this.proposalId, 1)).to.emit(governor, "VoteCast");

        // Vote: B against
        await expect( governor.connect(this.bUser).castVote(this.proposalId, 2)).to.emit(governor, "VoteCast");

        await mine(Number(await governor.votingPeriod()) + 1);

        let clock2  = await governor.clock();
        await mine(1);

        await tokamaktoken.connect(this.bUser).delegate(this.bUser.address);

        let clock3  = await governor.clock();
        await mine(1);

        // // getVotes
        // let getVotes_a = await governor.getVotes(this.aUser.address, clock0)
        // let getVotes_b = await governor.getVotes(this.bUser.address, clock0)

        // console.log('after delegating, getVotes_a ', getVotes_a)
        // console.log('after delegating, getVotes_b ', getVotes_b)

        // getVotes_a = await governor.getVotes(this.aUser.address, clock1)
        // getVotes_b = await governor.getVotes(this.bUser.address, clock1)

        // console.log('after changing delegate (b -> a), getVotes_a', getVotes_a)
        // console.log('after changing delegating, getVotes_b', getVotes_b)

        // getVotes_a = await governor.getVotes(this.aUser.address, clock2)
        // getVotes_b = await governor.getVotes(this.bUser.address, clock2)

        // console.log('after closing the voting period, getVotes_a ', getVotes_a)
        // console.log('after closing the voting period, getVotes_b ', getVotes_b)

        // getVotes_a = await governor.getVotes(this.aUser.address, clock3)
        // getVotes_b = await governor.getVotes(this.bUser.address, clock3)

        // console.log('after changing delegate (b -> b), getVotes_a ', getVotes_a)
        // console.log('after changing delegate, getVotes_b ', getVotes_b)

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

    });

});