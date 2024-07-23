import { ethers } from "hardhat";
import { expect } from "chai";

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import type { Signers } from "./types";

// import {deployGovernanceContractsFixture } from "./Goverance/Governance.fixture";
import {tonStakingV2ContractsFixture } from "./TonStakingV2.fixture";

describe("TokamakGovernor Test", async function () {
    before(async function () {
        this.signers = {} as Signers;

        const signers = await ethers.getSigners();
        this.signers.admin = signers[0];
        this.signers.notAuthorized = signers[1];

        this.loadFixture = loadFixture;
    });

    before(async function () {

        const {token, timelock, governor, depositManager, seigManagerProxy, seigManager, seigManagerV1_Vote } = await this.loadFixture(tonStakingV2ContractsFixture);
        const tokenAddress = token.getAddress()

        this.governor = governor;
        this.token = token;
        this.timelock = timelock;

        this.depositManager = depositManager;
        this.seigManagerProxy = seigManagerProxy;
        this.seigManager = seigManager;
        this.seigManagerV1_Vote = seigManagerV1_Vote;

    });

    it("test", async function () {
        // const { depositManager, seigManagerProxy, seigManager, seigManagerV1_Vote } = this;
        const { governor, _, } = this;

        const clock_mode = await governor.CLOCK_MODE();

        expect(clock_mode).to.be.equal("mode=blocknumber&from=default");
    });

});