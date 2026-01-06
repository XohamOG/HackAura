const { ethers } = require("ethers");


// Helachain RPC endpoint
const provider = new ethers.JsonRpcProvider("https://testnet-rpc.helachain.com");

// Your transaction hashes
const txs = [
  "0x6fd4dc657033d3026b84cdcca391d8063f1b3005ea158cd374dffc6ffce71666", // donation to repo
  "0x8ecfceb1a48a7bacb75582b3bb1539d96d14cd9e82a01e15911b3a2d1e03a084", // donate to repository
  "0x8cd46a8cc81420671c118af68ce8443cd1704f577c18f4eb6353f24538e410a3"  // repo registration
];

async function verifyTransactions() {
  console.log("🔍 Fetching transaction details from Helachain Testnet...");
  
  for (const hash of txs) {
    const tx = await provider.getTransaction(hash);
    if (!tx) {
      console.log(`⚠️ Transaction not found: ${hash}`);
      continue;
    }

    console.log("\n====================================");
    console.log(`📄 Tx Hash: ${hash}`);
    console.log(`From: ${tx.from}`);
    console.log(`To: ${tx.to}`);
    console.log(`Value: ${ethers.formatEther(tx.value)} HLUSD`);
    console.log("Status: Success (if confirmed on explorer)");
  }
}

verifyTransactions();
