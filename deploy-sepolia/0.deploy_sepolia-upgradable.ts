import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades, network } from "hardhat"

import { Signer } from "ethers"

import { config } from "../deploy.tokamak.tally.config"
import { getExpectedContractAddress } from "../helpers/expected_contract"
import SeigManagerV1_Vote_Json from '../test/abi/SeigManagerV1_Vote.json'
import { TokamakTimelockController__factory, TokamakVoteERC20__factory, TokamakGovernor__factory } from "../typechain-types/factories/contracts";

let TokamakVoteERC20_Owners = {
    admin: "0x757DE9c340c556b56f62eFaE859Da5e08BAAE7A2",
    pauser: "0x757DE9c340c556b56f62eFaE859Da5e08BAAE7A2",
    minter: "0x757DE9c340c556b56f62eFaE859Da5e08BAAE7A2"
}

const deployTallyDAO: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    console.log('deploy hre.network.config.chainId', hre.network.config.chainId)
    console.log('deploy hre.network.name', hre.network.name)

    const { deployer, SeigManager } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;
    const deploySigner = await hre.ethers.getSigner(deployer);
    console.log(deployer)

    if (hre.network.name == "hardhat" || hre.network.name == "local") {

        await hre.network.provider.send("hardhat_setBalance", [
            deployer,
            "0x10000000000000000000000000",
          ]);
    }

    //=========================== ==========
    // const TokamakVoteERC20 = await ethers.getContractFactory("TokamakVoteERC20");
    // const tokamaktoken = await upgrades.deployProxy(
    //     TokamakVoteERC20,
    //     [
    //         config.token.name,
    //         config.token.symbol,
    //         TokamakVoteERC20_Owners.admin, // admin
    //         TokamakVoteERC20_Owners.pauser, // pauser
    //         TokamakVoteERC20_Owners.minter, // minter
    //         SeigManager // seigManager
    //     ]
    // );
    // await tokamaktoken.waitForDeployment();
    // console.log("TokamakVoteERC20 deployed to:", await tokamaktoken.getAddress());
    // const token_address = await tokamaktoken.getAddress()
    const token_address = "0xE9394DAE067eF993Bb79d98917799CfA48BC83F0"
    //=========================== ==========
    // TIMELOCK CONTRACT
    const TimelockController:TokamakTimelockController__factory =  (await ethers.getContractFactory("contracts/TokamakTimelockController.sol:TokamakTimelockController")) as TokamakTimelockController__factory
    // GOVERNOR CONTRACT
    const TokamakGovernor:TokamakGovernor__factory = (await ethers.getContractFactory("contracts/TokamakGovernor.sol:TokamakGovernor")) as TokamakGovernor__factory

    // npx hardhat test 으로 테스트할때, 아래 파라미터를 0 , 1 로 수정해야 함.
    let timelock_address = await getExpectedContractAddress(deploySigner, 1);
    console.log('timelock_address', timelock_address)

    let governance_address = await getExpectedContractAddress(deploySigner,3);
    console.log('governance_address', governance_address)
    const admin_address = governance_address;

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
    if(timelock_address != await timelock.getAddress())  console.log('check!!!: timelock address');

    //=========================== ==========
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
    if(governance_address != await governor.getAddress())  console.log('check!!!: governance_address address');

    //=================

    // const SeigManagerV1_Vote_Dep = await ethers.getContractFactory(SeigManagerV1_Vote_Json.abi, SeigManagerV1_Vote_Json.bytecode);
    // const SeigManagerV1_Vote = await SeigManagerV1_Vote_Dep.deploy();
    // await SeigManagerV1_Vote.waitForDeployment();
    // console.log('SeigManagerV1_Vote deployed to:', await SeigManagerV1_Vote.getAddress());

    //==== verify =================================
    if (hre.network.name != "hardhat" && hre.network.name != "local") {
        await hre.run("etherscan-verify", {
            network: hre.network.name
        });
    }
}

export default deployTallyDAO;
deployTallyDAO.tags = ['TallyDAO','all'];