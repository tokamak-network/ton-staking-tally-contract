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
 *
scenario 1.
(1) A Voting Rights Mint (200 tokens), B Voting Rights Mint (800 tokens)
(2) Vote: A for, B against
(3) Additional A voting rights (800 tokens) created during the voting period
(4) Voting result after the voting period ends?
 */

describe("TokamakGovernor : the 1st scenario", async function () {
    before(async function () {
        this.signers = {} as Signers;

        const signers = await ethers.getSigners();

        this.deployer  = signers[0];
        this.signers.admin = signers[1];
        this.signers.notAuthorized = signers[2];

        this.aUser  = signers[3];
        this.bUser  = signers[4];

        this.loadFixture = loadFixture;
    });

    before(async function () {

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

    before(async function () {

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

    it("A stake TON, B stake TON", async function () {

        await (await this.ton.connect(this.daoSigner).mint(this.aUser.address, 1100000000000000000000n)).wait()
        await (await this.ton.connect(this.daoSigner).mint(this.bUser.address, 1100000000000000000000n)).wait()

        const depositManager_address = await this.depositManager.getAddress()
        const depositAmount1000 = 1100000000000000000000n

        const data = marshalString(
            [depositManager_address, tonStakingV2Config.LevelCandidate]
              .map(unmarshalString)
              .map(str => padLeft(str, 64))
              .join(''),
        );

        const receipt1 = await (await this.ton.connect(this.aUser).approveAndCall(
            tonStakingV2Config.WTON,
            depositAmount1000,
            data
        )).wait()

        expect(receipt1).to.emit(this.depositManager, "Deposited");

        const receipt2 = await (await this.ton.connect(this.bUser).approveAndCall(
            tonStakingV2Config.WTON,
            depositAmount1000,
            data
        )).wait()

        expect(receipt2).to.emit(this.depositManager, "Deposited");


    });

    it("(1) A Voting Rights Mint (200 tokens), B Voting Rights Mint (800 tokens)", async function () {

        const { tokamaktoken, governor, signers, timelock } = this;
        const amount_200 = BigInt("2"+"0".repeat(20))
        const amount_800 = BigInt("8"+"0".repeat(20))
        await (await tokamaktoken.connect(this.aUser).mint(amount_200)).wait()
        await (await tokamaktoken.connect(this.bUser).mint(amount_800)).wait()

        // delegate - Delegates votes from the sender to `delegatee`.
        await tokamaktoken.connect(this.aUser).delegate(this.aUser.address);
        await tokamaktoken.connect(this.bUser).delegate(this.bUser.address);

    });

    it("(2) Vote: A for, B against", async function () {
        const { tokamaktoken, governor, signers, timelock } = this;

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

        //
        const numberOfBlocks = Number(await governor.votingDelay()) + 1;
        await mine(numberOfBlocks);

        let clock0  = await governor.clock();

        // options 0 = Against, 1 = For, 2 = Abstain
        // Vote: A for,
        await expect( governor.connect(this.aUser).castVote(this.proposalId, 1)).to.emit(governor, "VoteCast");

        // Vote: B against
        await expect( governor.connect(this.bUser).castVote(this.proposalId, 2)).to.emit(governor, "VoteCast");

        // getVotes
        let getVotes_a = await governor.getVotes(this.aUser.address, clock0)
        let getVotes_b = await governor.getVotes(this.bUser.address, clock0)

        expect(getVotes_a).to.be.eq(BigInt("2"+"0".repeat(20)))
        expect(getVotes_b).to.be.eq(BigInt("8"+"0".repeat(20)))
    });

    it("(3) Additional A voting rights (800 tokens) created during the voting period", async function () {

        const { tokamaktoken, governor, signers, timelock } = this;
        const amount_800 = BigInt("8"+"0".repeat(20))
        await (await tokamaktoken.connect(this.aUser).mint(amount_800)).wait()

        let clock0  = await governor.clock();
        await mine(2);

        // getVotes
        let getVotes_a = await governor.getVotes(this.aUser.address, clock0)
        let getVotes_b = await governor.getVotes(this.bUser.address, clock0)

        expect(getVotes_a).to.be.eq(BigInt("10"+"0".repeat(20)))
        expect(getVotes_b).to.be.eq(BigInt("8"+"0".repeat(20)))
    });

    it("(4) Voting result after the voting period ends? -> It will be executed ", async function () {

        const { tokamaktoken, governor, signers, timelock } = this;
        await mine(Number(await governor.votingPeriod()) + 1);

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