import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("balance", "Prints an account's balance")
  .addOptionalParam("account", "The account's address", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    const accs = await ethers.getSigners();
    const account = taskArgs.account || accs[0].address;
    const balance = await ethers.provider.getBalance(account);

    console.log(ethers.utils.formatEther(balance), "ETH");
  });

task("add-seq", "send a message")
  .addOptionalParam("contract", "The contract's address", "")
  .addOptionalParam("to", "The recipient's address", "")
  .addOptionalParam("seq", "The sequencer's address", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments } = hre;
    const accs = await ethers.getSigners();
    let contractAddr = taskArgs.contract;
    if (contractAddr === '') { 
      const d = await deployments.get("L1SequencerManager");
      contractAddr = d.address;
    }
    const contract = await ethers.getContractAt("L1SequencerManager", contractAddr, accs[0]);
    const to = taskArgs.to;
    if (to !== '') {
      const tx = await contract.setL2Receiver(to);
      console.log("Set receiver on L2 with tx hash", tx.hash);
      await tx.wait();
    }
    const tx = await contract.addSequencer(taskArgs.seq);
    console.log("Sent message to L2 Receiver  with tx hash", tx.hash);
    const rc = await tx.wait();
    console.log("Receipt", rc);
  });

task("rm-seq", "send a message")
  .addOptionalParam("contract", "The contract's address", "")
  .addOptionalParam("to", "The recipient's address", "")
  .addOptionalParam("seq", "The sequencer's address", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments } = hre;
    const accs = await ethers.getSigners();
    let contractAddr = taskArgs.contract;
    if (contractAddr === '') { 
      const d = await deployments.get("L1SequencerManager");
      contractAddr = d.address;
    }
    const contract = await ethers.getContractAt("L1SequencerManager", contractAddr, accs[0]);
    const to = taskArgs.to;
    if (to !== '') {
      const tx = await contract.setL2Receiver(to);
      console.log("Set receiver on L2 with tx hash", tx.hash);
      await tx.wait();
    }
    const tx = await contract.removeSequencer(taskArgs.seq);
    console.log("Sent message to L2 Receiver  with tx hash", tx.hash);
    const rc = await tx.wait();
    console.log("Receipt", rc);
  });

task("set-seq", "")
  .addOptionalParam("contract", "The contract's address", "")
  .addOptionalParam("to", "The recipient's address", "")
  .addOptionalParam("seq", "The sequencer's address", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments } = hre;
    const accs = await ethers.getSigners();
    let contractAddr = taskArgs.contract;
    if (contractAddr === '') {
      const d = await deployments.get("L1SequencerManager");
      contractAddr = d.address;
    }
    const contract = await ethers.getContractAt("L1SequencerManager", contractAddr, accs[0]);
    const to = taskArgs.to;
    if (to !== '') {
      const tx = await contract.setL2Receiver(to);
      console.log("Set receiver on L2 with tx hash", tx.hash);
      await tx.wait();
    }
    const tx = await contract.setSequencers([taskArgs.seq]);
    console.log("Sent message to L2 Receiver  with tx hash", tx.hash);
    const rc = await tx.wait();
    console.log("Receipt", rc);
  });


task("get-sequencers", "")
  .addOptionalParam("contract", "The contract's address", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments } = hre;
    let contractAddr = taskArgs.contract;
    if (contractAddr === '') {
      let d;
      try {
        d = await deployments.get("L1SequencerManager");
      } catch (e) {
        d = await deployments.get("L2SequencerRegistry");
      }
      contractAddr = d.address;
    }
    const contract = await ethers.getContractAt("L1SequencerManager", contractAddr);
    const seqs = await contract.getSequencers();
    console.log("Sequencers", seqs);
  });


task("listen", "listen for event")
  .addOptionalParam("contract", "The contract's address", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments } = hre;
    let contractAddr = taskArgs.contract;
    if (contractAddr === '') {
      const l2MessageTaker = await deployments.get("L2SequencerRegistry");
      contractAddr = l2MessageTaker.address;
    }
    const contract = await ethers.getContractAt("L2SequencerRegistry", contractAddr);

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    contract.on("AddSequencer", async (data, obj) => {
      console.log("I hear Add", data, obj);
      const tx = await ethers.provider.getTransaction(obj.transactionHash);
      console.log("Transaction", tx);
    });
    contract.on("RemoveSequencer", async (data, obj) => {
      console.log("I hear Remove", data, obj);
    });
    await sleep(3_000_000);
  });