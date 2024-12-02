// import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';
import "@nomicfoundation/hardhat-chai-matchers";
import '@typechain/hardhat'
import '@nomicfoundation/hardhat-ethers'

import { HardhatUserConfig } from "hardhat/types";
import "hardhat-deploy";
import dotenv from "dotenv" ;
dotenv.config();

const config: HardhatUserConfig = {
  namedAccounts: {
    deployer: 0,
    addr1: 1,
    addr2: 2,
    SeigManager: {
      default: 3,
      mainnet: '0x0b55a0f463b6defb81c6063973763951712d0e5f',
      goerli: '0x446ece59ef429B774Ff116432bbB123f1915D9E3',
      hardhat: '0x2320542ae933FbAdf8f5B97cA348c7CeDA90fAd7',
      local: '0x2320542ae933FbAdf8f5B97cA348c7CeDA90fAd7',
      sepolia: '0x2320542ae933FbAdf8f5B97cA348c7CeDA90fAd7'
    },
  },
  networks: {
    hardhat: {
      forking: {
        // url: `${process.env.ETHEREUM_URL}`,
        // blockNumber: 20366882
        url: `${process.env.SEPOLIA_URL}`,
        blockNumber: 7174230,
        // blockNumber:7106970
      },
      // deploy: ['deploy-sepolia']
    },
    mainnet: {
      url: `${process.env.ETHEREUM_URL}`,
      accounts: [`${process.env.PRIVATE_KEY}`],
      gasPrice: 10000000000,
      deploy: ['deploy']
    },
    sepolia: {
      url: `${process.env.SEPOLIA_URL}`,
      accounts: [`${process.env.PRIVATE_KEY}`],
      // deploy: ['deploy-sepolia']
    },
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 10,
    coinmarketcap: `${process.env.COINMARKETCAP_API_KEY}`
  },
  etherscan: {
    apiKey: {
      mainnet: `${process.env.ETHERSCAN_API_KEY}`,
      goerli: `${process.env.ETHERSCAN_API_KEY}`,
      sepolia: `${process.env.ETHERSCAN_API_KEY}`,
    } ,
  },
  solidity: {
    version: '0.8.27',
    settings: {
      // evmVersion: "cancun",
      // viaIR: true,
      optimizer: {
        enabled: true,
        runs: 625,
        // details: {
        //   yul: true,
        // },
      },
      metadata: {
        // do not include the metadata hash, since this is machine dependent
        // and we want all generated code to be deterministic
        // https://docs.soliditylang.org/en/v0.8.12/metadata.html
        bytecodeHash: 'none',
      },
    },
  },
};

export default config;
