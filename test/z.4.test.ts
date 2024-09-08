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

async function logBalanceAndVotes (governor, tokamaktoken, aUser, bUser, cUser, skipCompare) {
    let clock0  = await governor.clock();
    await mine(1);
    clock0  = await governor.clock();
    await mine(1);

    // getVotes
    let getVotes_a = await governor.getVotes(aUser.address, clock0)
    let getVotes_b = await governor.getVotes(bUser.address, clock0)
    let getVotes_c = await governor.getVotes(cUser.address, clock0)

    console.log('\ngetVotes_a ', getVotes_a)
    console.log('getVotes_b ', getVotes_b)
    console.log('getVotes_c ', getVotes_c)

    let balanceA = await tokamaktoken.balanceOf(aUser.address);
    let balanceB = await tokamaktoken.balanceOf(bUser.address);
    let balanceC = await tokamaktoken.balanceOf(cUser.address);
    console.log('\nbalanceA ', ethers.formatEther(balanceA))
    console.log('balanceB ', ethers.formatEther( balanceB))
    console.log('balanceC ', ethers.formatEther(balanceC))

    let totalVote = await tokamaktoken.getPastTotalSupply()
    console.log('\ntotalVote', totalVote)
    if (!skipCompare) expect(totalVote).to.be.eq(getVotes_a + getVotes_b + getVotes_c);

}

describe("TokamakGovernor : the 4nd test", async function () {
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

    it("1. mint ", async function () {
        // console.log("At the time of voting, the block must already be after a voting delay, so changing the delegation after voting has no impact.")

        const depositAmount1000 = 1100000000000000000000n

        await depositDepositManager (this.ton, this.daoSigner, this.depositManager, this.aUser, depositAmount1000)
        await depositDepositManager (this.ton, this.daoSigner, this.depositManager, this.bUser, depositAmount1000)

        const { tokamaktoken, governor, signers, timelock } = this;
        const amount_200 = BigInt("2"+"0".repeat(20))
        const amount_800 = BigInt("8"+"0".repeat(20))
        await (await tokamaktoken.connect(this.aUser).mint(amount_200)).wait()
        await (await tokamaktoken.connect(this.bUser).mint(amount_800)).wait()

        await logBalanceAndVotes (governor, tokamaktoken, this.aUser, this.bUser, this.deployer, true)
    })

    it("2. delegate self ( A and B)", async function () {

        const { tokamaktoken, governor } = this;

        // delegate - Delegates votes from the sender to `delegatee`.
        await tokamaktoken.connect(this.aUser).delegate(this.aUser.address);
        await tokamaktoken.connect(this.bUser).delegate(this.bUser.address);

        await logBalanceAndVotes (governor, tokamaktoken, this.aUser, this.bUser, this.deployer)

    })


    it("3. delegate A to B", async function () {

        const { tokamaktoken, governor } = this;

        await tokamaktoken.connect(this.aUser).delegate(this.bUser.address);
        await logBalanceAndVotes (governor, tokamaktoken, this.aUser, this.bUser, this.deployer)

    })

    it("4. mint amount to A ", async function () {

        const { tokamaktoken, governor  } = this;
        const amount_200 = BigInt("2"+"0".repeat(20))

        await (await tokamaktoken.connect(this.aUser).mint(amount_200)).wait()
        await logBalanceAndVotes (governor, tokamaktoken, this.aUser, this.bUser, this.deployer)

    })

    it("5. delegate A to C", async function () {

        const { tokamaktoken, governor } = this;

        await tokamaktoken.connect(this.aUser).delegate(this.deployer.address);
        await logBalanceAndVotes (governor, tokamaktoken, this.aUser, this.bUser, this.deployer)

    })


    it("6. mint amount to B ", async function () {

        const { tokamaktoken, governor} = this;
        const amount_200 = BigInt("2"+"0".repeat(20))
        await tokamaktoken.connect(this.bUser).mint(amount_200);
        await logBalanceAndVotes (governor, tokamaktoken, this.aUser, this.bUser, this.deployer)

    })

    it("7. burn amount to A ", async function () {

        const { tokamaktoken, governor,  } = this;
        const amount_200 = BigInt("2"+"0".repeat(20))


        await tokamaktoken.connect(this.aUser).burn(amount_200);
        await logBalanceAndVotes (governor, tokamaktoken, this.aUser, this.bUser, this.deployer)

    })

    it("8. burn amount to A ", async function () {

        const { tokamaktoken, governor,  } = this;
        const amount_200 = BigInt("2"+"0".repeat(20))


        await tokamaktoken.connect(this.aUser).burn(amount_200);
        await logBalanceAndVotes (governor, tokamaktoken, this.aUser, this.bUser, this.deployer)

    })

    it("9. mint amount to A ", async function () {

        const { tokamaktoken, governor  } = this;
        const amount_200 = BigInt("2"+"0".repeat(20))
        await tokamaktoken.connect(this.aUser).mint(amount_200);
        await logBalanceAndVotes (governor, tokamaktoken, this.aUser, this.bUser, this.deployer)

    })

    it("10. delegate A self ", async function () {

        const { tokamaktoken, governor,   } = this;
        await tokamaktoken.connect(this.aUser).delegate(this.aUser.address);
        await logBalanceAndVotes (governor, tokamaktoken, this.aUser, this.bUser, this.deployer)

    })


});