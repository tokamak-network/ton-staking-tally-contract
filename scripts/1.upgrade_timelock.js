const { ethers, upgrades } = require("hardhat");
// const { TokamakGovernor } = "../typechain-types/contracts/TokamakGovernor";
// const { TokamakGovernorUpgradeV2 } = "../typechain-types/contracts/TokamakGovernorUpgradeV2";
const ProxyAdminJson = require("../test/abi/ProxyAdmin.abi.json")
const { config } = require( "../deploy.tokamak.tally.config")
const TokamakGovernorUpgradeV2_Json = require('../test/abi/TokamakGovernorUpgradeV2.json')
const TokamakTimelockControllerV2_Json = require('../test/abi/TokamakTimelockControllerV2.json')

const ProxyAdminAddressOfGonernor = "0x008E629Ac5fAbD86E588eCA4d8f6755DAD5b6F0E"

const ProxyAdminAddressOfTimelock = "0x0bEe5c55d936A2bDDB306CFEe091A104eDeC33E3"

const timelock_address = "0x079cC994fA06C916bA74a5714B6f7672Bd6F7567"
const governor_address = "0x163de77dFe2eF689253d66D8B3fEB32eAdcb9DD3"
const token_address = "0xE9394DAE067eF993Bb79d98917799CfA48BC83F0"
const gnosis_saft = "0xb62Cff55292EC561e76B823ce126A806874a392E"
const adminAddress = "0x757DE9c340c556b56f62eFaE859Da5e08BAAE7A2"

async function main() {
	const signers = await ethers.getSigners();
	const admin = signers[0];

	// await hre.network.provider.send("hardhat_impersonateAccount", [
	// 	adminAddress,
	// ]);
	// await hre.network.provider.send("hardhat_setBalance", [
	// 	adminAddress,
	// 	"0x10000000000000000000000000",
	// ]);
	// const admin = await hre.ethers.getSigner(adminAddress);
	// console.log(`deployer address: ${adminAddress}`);

	const proxyAdminContract = new ethers.Contract(ProxyAdminAddressOfTimelock, ProxyAdminJson, admin )

	const TokamakTimelockControllerV2Dep = await ethers.getContractFactory("TokamakTimelockControllerV2");
	let tokamakTimelockControllerV2 = (await TokamakTimelockControllerV2Dep.deploy())
	await tokamakTimelockControllerV2.waitForDeployment();
	const tokamakTimelockControllerV2Address = await tokamakTimelockControllerV2.getAddress()
	// const tokamakTimelockControllerV2Address = "0x6880f3898F27b11C1f03b7161ceA62069BA41917"

	console.log(`tokamakTimelockControllerV2Address: ${tokamakTimelockControllerV2Address}`);

	const encodedData = tokamakTimelockControllerV2.interface.encodeFunctionData(
		'initialize',
		[
			config.timelock.minDelay,
			[governor_address, timelock_address, gnosis_saft],
            [governor_address, timelock_address, gnosis_saft],
            timelock_address,
		]
	);
	// const encodedData = "0xbe899c0f000000000000000000000000000000000000000000000000000000000000012c000000000000000000000000000000000000000000000000000000000000012c0000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000001c20"
	console.log(`encodedData:`, encodedData);

	let res = await (await proxyAdminContract.connect(admin).upgradeAndCall(
		timelock_address, tokamakTimelockControllerV2Address, encodedData)).wait()

	console.log(res)

	const tokamakTimelockController = new ethers.Contract(timelock_address, TokamakTimelockControllerV2_Json.abi, admin )
	let CANCELLER_ROLE = await tokamakTimelockController.CANCELLER_ROLE()
	console.log('CANCELLER_ROLE', CANCELLER_ROLE)

	let hasRole = await tokamakTimelockController.hasRole(CANCELLER_ROLE, gnosis_saft)
	console.log('hasRole', hasRole)
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
  });
