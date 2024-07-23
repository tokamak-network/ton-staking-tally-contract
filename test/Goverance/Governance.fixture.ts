
import { ethers, upgrades} from "hardhat";
// import hardhat from "hardhat";

import { getExpectedContractAddress } from "../../helpers/expected_contract";

import { type TokamakGovernor, type TokamakTimelockController, type TokamakVoteERC20, } from "../../typechain-types";
import { config } from "../../deploy.config"
import { TokamakTimelockController__factory, TokamakVoteERC20__factory, TokamakGovernor__factory } from "../../typechain-types/factories/contracts";

export async function deployGovernanceContractsFixture(): Promise<{
    token: TokamakVoteERC20;
    timelock: TokamakTimelockController;
    governor: TokamakGovernor;
}> {
    console.log("deployGovernanceContractsFixture")
    const signers = await ethers.getSigners();
    const deployerSigner = signers[0];
    console.log("deployerSigner", deployerSigner.address)

    // Load values for constructor from a ts file deploy.config.ts
    const governance_address = await getExpectedContractAddress(deployerSigner, 5);
    const timelock_address = await getExpectedContractAddress(deployerSigner, 3);
    const token_address = await getExpectedContractAddress(deployerSigner, 1);

    const admin_address = governance_address;

    // TOKEN CONTRACT
    const GovernorToken = (await ethers.getContractFactory("contracts/TokamakVoteERC20.sol:TokamakVoteERC20")) as TokamakVoteERC20__factory

    const token = await upgrades.deployProxy(
        GovernorToken,
        [
            config.token.name,
            config.token.symbol,
            deployerSigner.address,
            deployerSigner.address,
            deployerSigner.address,
        ]
    );
    await token.waitForDeployment();
    console.log('token deployed to:', await token.getAddress());

    // TIMELOCK CONTRACT
    const TimelockController:TokamakTimelockController__factory =  (await ethers.getContractFactory("contracts/TokamakTimelockController.sol:TokamakTimelockController")) as TokamakTimelockController__factory

    const timelock = await upgrades.deployProxy(
        TimelockController,
        [
            config.timelock.minDelay,
            [admin_address, timelock_address],
            [admin_address, timelock_address],
            timelock_address,
        ]
    );
    await timelock.waitForDeployment();
    console.log('timelock deployed to:', await timelock.getAddress());

    // GOVERNOR CONTRACT
    const TokamakGovernor = (await ethers.getContractFactory("contracts/TokamakGovernor.sol:TokamakGovernor")) as TokamakGovernor__factory

    const governor = await upgrades.deployProxy(
        TokamakGovernor,
        [
            config.governor.name,
            token_address,
            timelock_address,
            config.governor.votingDelay,
            config.governor.votingPeriod,
            config.governor.proposalThreshold,
            config.governor.quorumNumerator,
            config.governor.voteExtension,
        ]
    );
    await governor.waitForDeployment();
    console.log('governor deployed to:', await governor.getAddress());

    return { token, timelock, governor };
}
