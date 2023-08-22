import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";

import './tasks/messages';

let localTestMnemonic = "...";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      { 
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        }
      }
    ]
  },
  networks: {
    hardhat: {
      accounts: 
      {
        mnemonic: localTestMnemonic,
        accountsBalance: "10000000000000000000000000",
      },
    },
    localhost: {
      timeout: 500_000,
    },
    mynw: {
      url: "http://localhost:10002",
      accounts: {
        mnemonic: localTestMnemonic,
        count: 4,
      },
      timeout: 100_000,
    },
    myl2: {
      url: "http://localhost:8545",
      accounts: {
        mnemonic: localTestMnemonic,
      },
    },
    
  },
  namedAccounts: {
    deployer: 0,
    tokenMinter: 0,
  },
};

export default config;
