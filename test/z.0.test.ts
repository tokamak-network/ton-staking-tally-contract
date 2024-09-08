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

import { tonStakingV2Config } from "../tostakingv2.config"
import { config } from "../deploy.tokamak.tally.config"

describe("TokamakGovernor basic functionality", async function () {
    before(async function () {
        this.signers = {} as Signers;

        const signers = await ethers.getSigners();

        this.deployer  = signers[0];
        this.signers.admin = signers[1];
        this.signers.notAuthorized = signers[2];

        this.loadFixture = loadFixture;
    });

    beforeEach(async function () {

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

        await network.provider.send("hardhat_impersonateAccount", [ daoAddress, ]);
        await network.provider.send("hardhat_setBalance", [ daoAddress,  "0x10000000000000000000000000", ]);

        this.daoSigner = await ethers.getSigner(daoAddress);
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

    it("(The amount of staking TON / 1e9) is the amount of votes that can be issued.", async function () {
        const { tokamaktoken, governor, signers, timelock } = this;
        let holder_address = await this.stakingHolder.getAddress()
        let stakedAmount = await this.seigManager.stakeOf(holder_address)
        let mintableAmount = await tokamaktoken.mintableAmount(holder_address)
        expect(mintableAmount).to.be.eq(stakedAmount / 1000000000n)
    });

    it("If you mint a vote token, the amount of the vote token cannot be unstaken from simple staking.", async function () {
        const { tokamaktoken, governor, signers, timelock } = this;
        let holder_address = await this.stakingHolder.getAddress()
        let stakedAmount = await this.seigManager.stakeOf(holder_address)
        let mintableAmount = await tokamaktoken.mintableAmount(holder_address)
        expect(mintableAmount).to.be.eq(stakedAmount / 1000000000n)

        let mintAmount = mintableAmount - 100n

        await (await tokamaktoken.connect(this.stakingHolder).mint(mintAmount)).wait()

        let availableRequestWithdrawAmount = await this.seigManagerV1_Vote.availableRequestWithdraw(holder_address)
        expect(await tokamaktoken.balanceOf(this.stakingHolder.address)).to.be.eq(mintAmount)

        let stakedAmountLevel = await this.seigManager["stakeOf(address,address)"](tonStakingV2Config.LevelCandidate, holder_address)

        await expect(
            this.depositManager.connect(this.stakingHolder).requestWithdrawal(tonStakingV2Config.LevelCandidate, stakedAmountLevel)
        ).to.be.rejectedWith("SeigManager: InsufficientStaked")

        const receipt = await (await this.depositManager.connect(this.stakingHolder).requestWithdrawal(tonStakingV2Config.LevelCandidate, 100n)).wait()
        expect(receipt).to.emit(this.depositManager, "WithdrawalRequested");

    });

    it("If you burn a vote token, the amount that can be unstaken in simple staking should increase by the amount burned.", async function () {
        const { tokamaktoken, governor, signers, timelock } = this;
        let holder_address = await this.stakingHolder.getAddress()

        let mintableAmount = await tokamaktoken.mintableAmount(holder_address)
        let mintAmount = mintableAmount - 100n
        await (await tokamaktoken.connect(this.stakingHolder).mint(mintAmount)).wait()

        let votesAmountInSeigManager = await this.seigManagerV1_Vote.votes(holder_address)
        let balanceOf = await tokamaktoken.balanceOf(holder_address)
        expect(mintAmount).to.be.eq(votesAmountInSeigManager / 1000000000n)
        expect(balanceOf).to.be.eq(votesAmountInSeigManager / 1000000000n)

        let stakedAmountLevel = await this.seigManager["stakeOf(address,address)"](tonStakingV2Config.LevelCandidate, holder_address)
        await expect(
            this.depositManager.connect(this.stakingHolder).requestWithdrawal(tonStakingV2Config.LevelCandidate, stakedAmountLevel)
        ).to.be.rejectedWith("SeigManager: InsufficientStaked")

        const receipt1 = await (await tokamaktoken.connect(this.stakingHolder).burn(mintAmount)).wait()
        expect(receipt1).to.emit(tokamaktoken, "Transfer");

        const receipt2 = await (await this.depositManager.connect(this.stakingHolder).requestWithdrawal(tonStakingV2Config.LevelCandidate, stakedAmountLevel)).wait()
        expect(receipt2).to.emit(this.depositManager, "WithdrawalRequested");

        const receipt3 = await (await this.depositManager.connect(this.stakingHolder).redeposit(tonStakingV2Config.LevelCandidate)).wait()
        expect(receipt3).to.emit(this.depositManager, "Deposited");

    });


    it("A proposal can be submitted only if the number of voting rights is equal or greater than proposalThreshold.", async function () {
        const { tokamaktoken, governor, signers, timelock } = this;
        const proposalThreshold = await governor.proposalThreshold() // for voting unit

        const mintAmount = proposalThreshold*proposalThreshold - 1000n

        // const mintAmount = proposalThreshold*proposalThreshold

        let holder_address = await this.stakingHolder.getAddress()
        let mintableAmount = await tokamaktoken.mintableAmount(holder_address)

        expect(mintableAmount).to.be.gte(ethers.toBigInt(mintAmount.toString())) //

        // The number of votes is less than proposalThreshold
        await tokamaktoken.connect(this.stakingHolder).mint(mintAmount);
        // console.log('mintAmount', ethers.formatEther(mintAmount))

        let balance = await tokamaktoken.balanceOf(this.stakingHolder.address)
        expect(mintAmount).to.be.eq(balance)
        // console.log('balance', ethers.formatEther(balance))

        let sqrt = await tokamaktoken.sqrt(balance)
        // console.log('sqrt', ethers.formatEther(sqrt))

        let votesAmountPrev = await tokamaktoken.getVotes(this.stakingHolder.address)
        // console.log('votesAmount Before delegating', ethers.formatEther(votesAmountPrev))

        // delegate - Delegates votes from the sender to `delegatee`.
        await tokamaktoken.connect(this.stakingHolder).delegate(this.stakingHolder.address);

        let votesAmountAfter = await tokamaktoken.getVotes(this.stakingHolder.address)
        expect(votesAmountAfter).to.be.eq(votesAmountPrev + (sqrt))
        // console.log('votesAmount After delegating', ethers.formatEther(votesAmountAfter))

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
        await expect(governor.connect(this.stakingHolder).propose(
            proposalInfo.targets, // targets
            proposalInfo.value, // value
            proposalInfo.calldata,
            proposalInfo.description// description
        )).to.be.rejectedWith(
            "GovernorInsufficientProposerVotes(\""+this.stakingHolder.address+"\", "+votesAmountAfter+", "+proposalThreshold+")");
    });

    it("should work the full proposal lifecycle up to executed", async function () {
        const { tokamaktoken, governor, signers, timelock } = this;
        const proposalThreshold = await governor.proposalThreshold()
        const balancePrev = await this.ton.balanceOf(signers.admin.address)
        let holder_address = await this.stakingHolder.getAddress()

        const balanceToken = await tokamaktoken.balanceOf(holder_address)
        const mintAmount = proposalThreshold*proposalThreshold - balanceToken
        console.log('mintAmount', ethers.formatEther(mintAmount) )

        let mintableAmount = await tokamaktoken.mintableAmount(holder_address)
        expect(mintableAmount).to.be.gte(ethers.toBigInt(mintAmount.toString())) //

        await tokamaktoken.connect(this.stakingHolder).mint(mintAmount);

        const balanceOne = await tokamaktoken.balanceOf(this.stakingHolder.address);
        expect(balanceOne).to.be.equal(mintAmount);
        console.log('balance', ethers.formatEther(balanceOne))

        let votesAmountPrev = await tokamaktoken.getVotes(this.stakingHolder.address)
        console.log('votesAmount Before delegating', ethers.formatEther(votesAmountPrev))

        // getVotes
        let clock0  = await governor.clock();

        // delegate - Delegates votes from the sender to `delegatee`.
        await tokamaktoken.connect(this.stakingHolder).delegate(this.stakingHolder.address);

        // getVotes
        let clock1  = await governor.clock();
        let votesAmountAfter = await tokamaktoken.getVotes(this.stakingHolder.address)
        console.log('votesAmount After delegating', ethers.formatEther(votesAmountAfter))
        console.log('================')

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
        const proposalTx = await governor.connect(this.stakingHolder).propose(
            proposalInfo.targets, // targets
            proposalInfo.value, // value
            proposalInfo.calldata,
            proposalInfo.description// description
        );

        expect(proposalTx).to.emit(governor, "ProposalCreated");
        let clock2  = await governor.clock();

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
        let clock3  = await governor.clock();

        // Vote
        await expect( governor.connect(this.stakingHolder).castVote(proposalId, support)).to.emit(governor, "VoteCast");
        let clock4 = await governor.clock();

        // await mine(1);

        // console.log('clock0 : before delegating ', await governor.getVotes(this.stakingHolder.address, clock0))
        // console.log('clock1 : after delegating ', await governor.getVotes(this.stakingHolder.address, clock1))
        // console.log('clock2 : after proposing   ', await governor.getVotes(this.stakingHolder.address, clock2))
        // console.log('clock3 : after delaying votingDelay  ', await governor.getVotes(this.stakingHolder.address, clock3))
        // console.log('clock4 : after castVoting ', await governor.getVotes(this.stakingHolder.address, clock4))

        // getVotes
        expect(await governor.getVotes(this.stakingHolder.address, clock0)).to.be.eq(0)
        expect(await governor.getVotes(this.stakingHolder.address, clock1)).to.be.eq(
            await tokamaktoken.sqrt(mintAmount))


        let votesAmount = await tokamaktoken.getVotes(this.stakingHolder.address)
        console.log('votesAmount', votesAmount)


        let getPastVotes = await tokamaktoken.getPastVotes(this.stakingHolder.address, clock1)
        console.log('getPastVotes', getPastVotes)

        let getPastVoteTotal = await tokamaktoken.getPastTotalSupply()
        console.log('getPastVoteTotal', getPastVoteTotal)

        let quorum = await governor.quorum(clock1)
        console.log('quorum', quorum)

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

        // enum ProposalState {
        //     Pending,
        //     Active,
        //     Canceled,
        //     Defeated,
        //     Succeeded,
        //     Queued,
        //     Expired,
        //     Executed
        // }

        // Check if admin's balance has increased
        const balance = await this.ton.balanceOf(signers.admin.address);
        expect(balance).to.be.equal(balancePrev + 1000n);
    });

    it("should cancel the proposal before vote start", async function () {
        const { tokamaktoken, governor, signers, timelock } = this;
        const proposalThreshold = await governor.proposalThreshold()
        let holder_address = await this.stakingHolder.getAddress()

        // initial mint
        const mintVotesAmount = proposalThreshold*proposalThreshold
        await tokamaktoken.connect(this.stakingHolder).mint(mintVotesAmount);

        const balanceOne = await tokamaktoken.balanceOf(this.stakingHolder.address);
        expect(balanceOne).to.be.equal(mintVotesAmount);

        // delegate
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
        const proposalTx = await governor.connect(this.stakingHolder).propose(
            proposalInfo.targets, // targets
            proposalInfo.value, // value
            proposalInfo.calldata,
            proposalInfo.description// description
        );

        expect(proposalTx).to.emit(governor, "ProposalCreated");

        // Wait for the transaction to be mined
        const receipt = await proposalTx.wait(1);

        // console.log("proposalId",receipt?.logs);

        const eventLogs: EventLog[] = (receipt?.logs ?? []).filter((log): log is EventLog => true);

        // Find the ProposalCreated event in the transaction receipt
        const event = eventLogs.find((log) => log.fragment.name === "ProposalCreated");

        const logDescription = governor.interface.parseLog({
            topics: event?.topics ? [...event.topics] : [],
            data: event?.data ?? "",
        });

        // Get the proposalId from the event arguments
        const proposalId = logDescription?.args["proposalId"]

        // try to cancel it
        await expect( governor.connect(this.stakingHolder).cancel(
            proposalInfo.targets,
            proposalInfo.value,
            proposalInfo.calldata,
            ethers.keccak256(ethers.toUtf8Bytes(proposalInfo.description))
        )).to.emit(governor, "ProposalCanceled");

        const proposalState = await governor.state(proposalId);
        expect(proposalState).to.be.equal(2);

        // enum ProposalState {
        //     Pending,
        //     Active,
        //     Canceled,
        //     Defeated,
        //     Succeeded,
        //     Queued,
        //     Expired,
        //     Executed
        // }
    });

    it("should not cancel the proposal after vote starts", async function () {
        const { tokamaktoken, governor, signers, timelock } = this;
        const proposalThreshold = await governor.proposalThreshold()
        const balancePrev = await this.ton.balanceOf(signers.admin.address)
        let holder_address = await this.stakingHolder.getAddress()

        // initial mint
        const mintVotesAmount = proposalThreshold*proposalThreshold
        await tokamaktoken.connect(this.stakingHolder).mint(mintVotesAmount);

        const balanceOne = await tokamaktoken.balanceOf(this.stakingHolder.address);
        expect(balanceOne).to.be.equal(mintVotesAmount);

        // delegate
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
        const proposalTx = await governor.connect(this.stakingHolder).propose(
            proposalInfo.targets, // targets
            proposalInfo.value, // value
            proposalInfo.calldata,
            proposalInfo.description// description
        );

        expect(proposalTx).to.emit(governor, "ProposalCreated");

        // Wait for the transaction to be mined
        const receipt = await proposalTx.wait(1);

        // console.log("proposalId",receipt?.logs);

        const eventLogs: EventLog[] = (receipt?.logs ?? []).filter((log): log is EventLog => true);

        // Find the ProposalCreated event in the transaction receipt
        const event = eventLogs.find((log) => log.fragment.name === "ProposalCreated");

        const logDescription = governor.interface.parseLog({
            topics: event?.topics ? [...event.topics] : [],
            data: event?.data ?? "",
        });

        // Get the proposalId from the event arguments
        const proposalId = logDescription?.args["proposalId"]

        const numberOfBlocks = Number(await governor.votingDelay()) + 100;
        await mine(numberOfBlocks);

        // try to cancel it
        await expect( governor.connect(this.stakingHolder).cancel(
            proposalInfo.targets,
            proposalInfo.value,
            proposalInfo.calldata,
            ethers.keccak256(ethers.toUtf8Bytes(proposalInfo.description))
        )).to.be.reverted;

        const proposalState = await governor.state(proposalId);
        expect(proposalState).to.be.equal(1);
    });

    it("should be able to see proposal defeated", async function () {
        const { tokamaktoken, governor, signers, timelock } = this;
        const proposalThreshold = await governor.proposalThreshold()
        const balancePrev = await this.ton.balanceOf(signers.admin.address)
        let holder_address = await this.stakingHolder.getAddress()

        // initial mint
        const amountToMint = 10000n;
        const mintVotesAmount = proposalThreshold*proposalThreshold
        await tokamaktoken.connect(this.stakingHolder).mint(mintVotesAmount);

        const balanceOne = await tokamaktoken.balanceOf(this.stakingHolder.address);
        expect(balanceOne).to.be.equal(mintVotesAmount);

        // delegate
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
        const proposalTx = await governor.connect(this.stakingHolder).propose(
            proposalInfo.targets, // targets
            proposalInfo.value, // value
            proposalInfo.calldata,
            proposalInfo.description// description
        );

        expect(proposalTx).to.emit(governor, "ProposalCreated");

        // Wait for the transaction to be mined
        const receipt = await proposalTx.wait(1);

        // console.log("proposalId",receipt?.logs);

        const eventLogs: EventLog[] = (receipt?.logs ?? []).filter((log): log is EventLog => true);

        // Find the ProposalCreated event in the transaction receipt
        const event = eventLogs.find((log) => log.fragment.name === "ProposalCreated");

        const logDescription = governor.interface.parseLog({
            topics: event?.topics ? [...event.topics] : [],
            data: event?.data ?? "",
        });

        // Get the proposalId from the event arguments
        const proposalId = logDescription?.args["proposalId"]

        const numberOfBlocks = Number(await governor.votingDelay()) + 100;
        await mine(numberOfBlocks);

        // Vote
        await expect( governor.connect(this.stakingHolder).castVote(proposalId,0)).to.emit(governor, "VoteCast");

        // Wait for voting period to end
        // await ethers.provider.send("evm_increaseTime", [86400]); // Increase time by 1 day
        // await ethers.provider.send("evm_mine"); // Mine a new block
        await mine(Number(await governor.votingPeriod()) + 100);

        // expect state to be deafeated
        const proposalState = await governor.state(proposalId);
        expect(proposalState).to.be.equal(3);

        // enum ProposalState {
        //     Pending,
        //     Active,
        //     Canceled,
        //     Defeated,
        //     Succeeded,
        //     Queued,
        //     Expired,
        //     Executed
        // }
    });

});