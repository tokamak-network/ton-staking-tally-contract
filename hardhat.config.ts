import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';
import "@nomicfoundation/hardhat-chai-matchers";

import dotenv from "dotenv" ;
dotenv.config();

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        url: `${process.env.ETHEREUM_URL}`,
        blockNumber: 20366882
      },
    },
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 10,
    coinmarketcap: `${process.env.COINMARKETCAP_API_KEY}`
  },
  solidity: {
    version: '0.8.24',
    settings: {
      // evmVersion: "cancun",
      // viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
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
