
import { ethers, upgrades, network} from "hardhat";
// import hardhat from "hardhat";
import { Signer, Contract } from 'ethers'
import { expect } from './shared/expect'
import { encodeFunctionSignature } from 'web3-eth-abi'
import { tonStakingV2Config } from "../tostakingv2.config"
import { getExpectedContractAddress } from "../helpers/expected_contract";

import { type TokamakGovernor, type TokamakTimelockController, type TokamakVoteERC20, } from "../typechain-types";
import { config } from "../deploy.tokamak.tally.config"
import { TokamakTimelockController__factory, TokamakVoteERC20__factory, TokamakGovernor__factory } from "../typechain-types/factories/contracts";

import { SeigManagerV1_3 } from "./types/contracts/stake/managers/SeigManagerV1_3.sol/SeigManagerV1_3";
import { SeigManagerProxy } from "./types/contracts/stake/managers/SeigManagerProxy";
import { DepositManager } from "./types/contracts/stake/managers/DepositManager.sol/DepositManager";
import { SeigManagerV1_2 } from "./types/contracts/stake/managers/SeigManagerV1_2.sol";
import { SeigManagerV1_Vote } from "./types/contracts/stake/managers/SeigManagerV1_Vote.sol";

import DepositManager_Json from './abi/DepositManager.json'
import SeigManagerProxy_Json from './abi/SeigManagerProxy.json'
import SeigManagerV1_2_Json from './abi/SeigManagerV1_2.json'
import SeigManagerV1_Vote_Json from './abi/SeigManagerV1_Vote.json'
import DAOCommitteeAddV1_1_Json from './abi/DAOCommitteeAddV1_1.json'
import DAOCommitteeProxy_Json from './abi/DAOCommitteeProxy.json'
import TON_Json from './abi/TON.json'
import TOS_Json from './abi/TOS.json'

const daoOwnerAddress = "0xB4983DA083A5118C903910DB4f5a480B1D9f3687"
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

export async function tonStakingV2ContractsFixture(): Promise<{
    tokamaktoken: TokamakVoteERC20;
    timelock: TokamakTimelockController;
    governor: TokamakGovernor;
    depositManager: DepositManager;
    seigManagerProxy: SeigManagerProxy;
    seigManager: SeigManagerV1_2;
    seigManagerV1_Vote: SeigManagerV1_Vote;
    dao: Contract;
    ton: Contract;
    tos: Contract;
    stakingHolder: Signer
}> {
    const signers = await ethers.getSigners();
    const deployerSigner = signers[0];
    const adminSigner = signers[1];
    let daoOwner: Signer;
    let stakingHolder: Signer;

    await network.provider.send("hardhat_impersonateAccount", [ daoOwnerAddress, ]);
    await network.provider.send("hardhat_setBalance", [ daoOwnerAddress,  "0x10000000000000000000000000", ]);
    daoOwner = await ethers.getSigner(daoOwnerAddress);

    await network.provider.send("hardhat_impersonateAccount", [ tonStakingV2Config.StakingHolder, ]);
    await network.provider.send("hardhat_setBalance", [ tonStakingV2Config.StakingHolder,  "0x10000000000000000000000000", ]);
    stakingHolder =  await ethers.getSigner(tonStakingV2Config.StakingHolder);

    // Load values for constructor from a ts file tonStakingV2Config.config.ts
    const seigManager_address = tonStakingV2Config.SeigManagerProxy;
    const depositManager_address = tonStakingV2Config.DepositManagerProxy;
    const dao_address = tonStakingV2Config.DAOCommitteeProxy;

    //CONTRACT
    const depositManager = (new ethers.Contract(depositManager_address,  DepositManager_Json.abi, deployerSigner)) as DepositManager;
    const seigManagerProxy = (new ethers.Contract(seigManager_address,  SeigManagerProxy_Json.abi, deployerSigner)) as SeigManagerProxy;
    const seigManager = (new ethers.Contract(seigManager_address,  SeigManagerV1_2_Json.abi, deployerSigner)) as SeigManagerV1_2;
    const daoProxy = new ethers.Contract(dao_address, DAOCommitteeProxy_Json.abi, deployerSigner);
    const ton = new ethers.Contract(tonStakingV2Config.TON, TON_Json.abi, deployerSigner);
    const tos = new ethers.Contract(tonStakingV2Config.TOS, TOS_Json.abi, deployerSigner);

    //-- dao
    const dao_Contract = await (new ethers.ContractFactory(DAOCommitteeAddV1_1_Json.abi, DAOCommitteeAddV1_1_Json.bytecode, deployerSigner)).connect(deployerSigner).deploy() ;
    // console.log('dao_Contract', dao_Contract.target)
    await (await daoProxy.connect(daoOwner).upgradeTo(dao_Contract.target)).wait()
    // console.log('upgradeTo')
    const dao = new ethers.Contract(dao_address, DAOCommitteeAddV1_1_Json.abi, deployerSigner);

    // add functions related to vote
    // const seigManagerV1_Vote = (new ethers.Contract(seigManager_address,  SeigManagerV1_Vote_Json.abi, deployerSigner)) as SeigManagerV1_Vote;
    const seigManagerV1_Vote_Contract = await (new ethers.ContractFactory(SeigManagerV1_Vote_Json.abi, SeigManagerV1_Vote_Json.bytecode, deployerSigner)).connect(deployerSigner).deploy() ;
    // console.log('seigManagerV1_Vote_Contract', seigManagerV1_Vote_Contract.target)
    const seigManagerV1_Vote_address = seigManagerV1_Vote_Contract.target
    // console.log('seigManagerV1_Vote_address', seigManagerV1_Vote_address)

    // add functions
    const index = 1;
    expect(await seigManagerProxy.implementation2(index)).to.be.eq(ZERO_ADDRESS)

    const selector1 = encodeFunctionSignature("increaseVoteToken(address,uint256)");
    const selector2 = encodeFunctionSignature("decreaseVoteToken(address,uint256)");
    const selector3 = encodeFunctionSignature("onWithdraw(address,address,uint256)");
    const selector4 = encodeFunctionSignature("availableRequestWithdraw(address)");
    const selector5 = encodeFunctionSignature("setVoteToken(address)");
    const selector6 = encodeFunctionSignature("votes(address)");
    const selector7 = encodeFunctionSignature("voteToken()");
    const selector8 = encodeFunctionSignature("totalVotes()");

    let functionBytecodes = [selector1, selector2, selector3, selector4, selector5, selector6, selector7, selector8];

    // mainnet
    await (await dao.connect(daoOwner).setTargetSetImplementation2(
        seigManager_address,
        seigManagerV1_Vote_address,
        index, true)).wait();

    // console.log('setTargetSetImplementation2 end')

    await (await dao.connect(daoOwner).setTargetSetSelectorImplementations2(
        seigManager_address,
        functionBytecodes,
        seigManagerV1_Vote_address)).wait()

    // sepolia
    // await (await seigManagerProxy.connect(daoOwner).setImplementation2(
    //     seigManagerV1_Vote_Contract.address,
    //     index, true)).wait();

    // await (await seigManagerProxy.connect(daoOwner).setSelectorImplementations2(
    //     functionBytecodes,
    //     seigManagerV1_Vote_Contract.address)).wait()

    expect(await seigManagerProxy.implementation2(index)).to.be.eq(seigManagerV1_Vote_address)
    expect(await seigManagerProxy.getSelectorImplementation2(selector1)).to.be.eq(seigManagerV1_Vote_address)
    expect(await seigManagerProxy.getSelectorImplementation2(selector2)).to.be.eq(seigManagerV1_Vote_address)
    expect(await seigManagerProxy.getSelectorImplementation2(selector3)).to.be.eq(seigManagerV1_Vote_address)
    expect(await seigManagerProxy.getSelectorImplementation2(selector4)).to.be.eq(seigManagerV1_Vote_address)

    const governance_address = await getExpectedContractAddress(deployerSigner, 5);
    const timelock_address = await getExpectedContractAddress(deployerSigner, 3);
    const token_address = await getExpectedContractAddress(deployerSigner, 1);

    const admin_address = governance_address;

    // console.log('governance_address', governance_address)
    // console.log('timelock_address', timelock_address)
    // console.log('token_address', token_address)

    //=========================== ==========
    // TOKEN CONTRACT
    const TokamakVoteERC20:TokamakVoteERC20__factory = (await ethers.getContractFactory("contracts/TokamakVoteERC20.sol:TokamakVoteERC20")) as TokamakVoteERC20__factory

    const tokamaktoken = await upgrades.deployProxy(
        TokamakVoteERC20,
        [
            config.token.name,
            config.token.symbol,
            adminSigner.address, // admin
            adminSigner.address, // pauser
            adminSigner.address, // minter
            seigManager_address // seigManager
        ]
    );
    await tokamaktoken.waitForDeployment();
    // console.log('token deployed to:', await token.getAddress());

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
    // console.log('timelock deployed to:', await timelock.getAddress());

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
    // console.log('governor deployed to:', await governor.getAddress());

    //=================
    await (await dao.connect(daoOwner).setVoteToken(seigManager_address, token_address)).wait();

    const seigManagerV1_Vote = (new ethers.Contract(seigManager_address, SeigManagerV1_Vote_Json.abi, deployerSigner)) as SeigManagerV1_Vote;

    return {  tokamaktoken, timelock, governor, depositManager, seigManagerProxy, seigManager, seigManagerV1_Vote, dao, ton, tos, stakingHolder };
}
