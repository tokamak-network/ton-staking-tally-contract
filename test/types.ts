import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/dist/src/signer-with-address";

import type { TokamakGovernor, TokamakTimelockController, TokamakVoteERC20 } from "../typechain-types";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
    export interface Context {
        governor: TokamakGovernor;
        token: TokamakVoteERC20;
        timelock: TokamakTimelockController;
        loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
        signers: Signers;
    }
}

export interface Signers {
    admin: SignerWithAddress;
    notAuthorized: SignerWithAddress;
}