import { ethers, network  } from "hardhat";
import { expect } from "chai";
import {
    EventLog,
} from "ethers";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
import hre from "hardhat";

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import type { Signers } from "./types";

// import {deployGovernanceContractsFixture } from "./Goverance/Governance.fixture";
import {tonStakingV2ContractsFixture } from "./TonStakingV2.fixture";

describe("TokamakGovernor Test", async function () {
    before(async function () {
        this.signers = {} as Signers;

        const signers = await ethers.getSigners();

        this.deployer  = signers[0];
        this.signers.admin = signers[1];
        this.signers.notAuthorized = signers[2];

        console.log("deployer ", this.deployer.address)
        console.log("admin ", this.signers.admin.address)
        console.log("notAuthorized ", this.signers.notAuthorized.address)

        this.loadFixture = loadFixture;
    });

    before(async function () {

        const {tokamaktoken, timelock, governor, depositManager,
                seigManagerProxy, seigManager, seigManagerV1_Vote,
                dao, ton, tos, stakingHolder
            } = await this.loadFixture(tonStakingV2ContractsFixture);

        const daoAddress = await dao.getAddress()

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

        console.log("daoAddress", daoAddress)

        await network.provider.send("hardhat_impersonateAccount", [ daoAddress, ]);
        await network.provider.send("hardhat_setBalance", [ daoAddress,  "0x10000000000000000000000000", ]);

        this.daoSigner = await ethers.getSigner(daoAddress);
    });

    it("should receive answer from CLOCK_MODE", async function () {
        const { governor, _, } = this;

        const clock_mode = await governor.CLOCK_MODE();

        expect(clock_mode).to.be.equal("mode=blocknumber&from=default");
    });

    it("clock should return the current block number", async function () {
        const { governor, _, } = this;

        const clock = await governor.clock();
        const pBlock = await ethers.provider.getBlock("latest");

        expect(clock).to.be.equal(pBlock?.number);
    });

    it("If SWTON is insufficient, mint cannot be performed.", async function () {
        const { tokamaktoken, governor, signers, timelock } = this;

        const amountToMint = 10000n;
        let stakedAmount = await this.seigManager.stakeOf(signers.admin.address)
        let mintableAmount = await tokamaktoken.mintableAmount(signers.admin.address)
        expect(mintableAmount).to.be.eq(0n)

        await expect(
            tokamaktoken.connect(signers.admin).mint(amountToMint)
        ).to.be.rejectedWith("InsufficientStakedAmount()")

    });

    it("Grant TON minter permission to timelock before creating agenda", async function () {
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

    it("should work the full proposal lifecycle up to executed", async function () {
        const { tokamaktoken, governor, signers, timelock } = this;

        const balancePrev = await this.ton.balanceOf(signers.admin.address);

        // mint (by minter) -> _update -> _transferVotingUnits
        let holder_address = await this.stakingHolder.getAddress()
        let stakedAmount = await this.seigManager.stakeOf(holder_address)
        let mintableAmount = await tokamaktoken.mintableAmount(holder_address)
        expect(mintableAmount).to.be.eq(stakedAmount / 1000000000n)
        expect(mintableAmount).to.be.gt(0)

        await tokamaktoken.connect(this.stakingHolder).mint(mintableAmount);

        const balanceOne = await tokamaktoken.balanceOf(this.stakingHolder.address);
        expect(balanceOne).to.be.equal(mintableAmount);

        // getVotes
        let clock0  = await governor.clock();

        // delegate - Delegates votes from the sender to `delegatee`.
        await tokamaktoken.connect(this.stakingHolder).delegate(this.stakingHolder.address);

        //===============================
        // agenda : mint 1000 ton to admin
        const calldata = this.ton.interface.encodeFunctionData("mint", [signers.admin.address, 1000n]);
        //===============================

        const proposalInfo = {
            targets: [await this.ton.getAddress()],
            value: [0n],
            calldata:  [calldata],
            description: "Proposal to mint 1000 tokens for admin"
        }

        // Propose
        const proposalTx = await governor.propose(
            proposalInfo.targets, // targets
            proposalInfo.value, // value
            proposalInfo.calldata,
            proposalInfo.description// description
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
        const proposalId = logDescription?.args["proposalId"]
        expect(logDescription?.args["description"]).to.be.eq(proposalInfo.description)

        const support = 1 // options 0 = Against, 1 = For, 2 = Abstain
        // try to cast before voting delay and fails
        await expect( governor.connect(this.stakingHolder).castVote(proposalId, support)).to.be.reverted;

        const numberOfBlocks = Number(await governor.votingDelay()) + 100;
        await mine(numberOfBlocks);
        let clock1  = await governor.clock();

        // Vote
        await expect( governor.connect(this.stakingHolder).castVote(proposalId, support)).to.emit(governor, "VoteCast");

        // getVotes
        expect(await governor.getVotes(this.stakingHolder.address, clock0)).to.be.eq(0)
        expect(await governor.getVotes(this.stakingHolder.address, clock1)).to.be.eq(mintableAmount)

        //try to queue before is executable and fails

        // Queue proposal
        // await  expect( governor.queue(proposalId)).to.be.reverted;
       await  expect( governor.queue(
            proposalInfo.targets,
            proposalInfo.value,
            proposalInfo.calldata,
            ethers.keccak256(ethers.toUtf8Bytes(proposalInfo.description)) // description
       )).to.be.reverted;

        // Wait for voting period to end
        // await ethers.provider.send("evm_increaseTime", [86400]); // Increase time by 1 day
        // await ethers.provider.send("evm_mine"); // Mine a new block
        await mine(Number(await governor.votingPeriod()) + 100);

        // expect proposal state to be succeeded
        let proposalState = await governor.state(proposalId);
        expect(proposalState).to.be.equal(4);

        // Queue proposal
        await expect( governor.queue(
            proposalInfo.targets,
            proposalInfo.value,
            proposalInfo.calldata,
            ethers.keccak256(ethers.toUtf8Bytes(proposalInfo.description))
        )).to.emit(governor, "ProposalQueued");

        // expect proposal state to be queued
        proposalState = await governor.state(proposalId);
        expect(proposalState).to.be.equal(5);

        // Execute proposal
        await expect( governor.connect(signers.notAuthorized).execute(
            proposalInfo.targets,
            proposalInfo.value,
            proposalInfo.calldata,
            ethers.keccak256(ethers.toUtf8Bytes(proposalInfo.description))
        )).to.be.reverted;

        // Simulate time delay required before execution
        // Replace 'executionDelay' with your contract's specific delay
        await mine( 86400 +1);

        // Execute proposal
        await expect( governor.connect(signers.notAuthorized).execute(
            proposalInfo.targets,
            proposalInfo.value,
            proposalInfo.calldata,
            ethers.keccak256(ethers.toUtf8Bytes(proposalInfo.description))
        )).to.emit(governor, "ProposalExecuted");

        // expect proposal state to be executed
        proposalState = await governor.state(proposalId);
        expect(proposalState).to.be.equal(7);

        // Check if admin's balance has increased
        const balance = await this.ton.balanceOf(signers.admin.address);
        expect(balance).to.be.equal(balancePrev + 1000n);
    });

    it("Scenario 1", async function () {
        console.log("(1) A Voting Rights Mint (200 tokens), B Voting Rights (800 tokens)")
        console.log("(2) Votes : A for, B against")
        console.log("(3) Additional A voting rights (800 tokens) created during the voting period ")
        console.log("(4) Voting result after the voting period ends : ")

    })

});