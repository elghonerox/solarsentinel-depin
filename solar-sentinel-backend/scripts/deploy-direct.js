import {
  Client,
  PrivateKey,
  ContractCreateTransaction,
  FileCreateTransaction,
  Hbar
} from "@hashgraph/sdk";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🚀 Deploying RewardPayout contract to Hedera testnet using Hedera SDK...");

  // Load account ID and HEX-encoded ECDSA private key from .env
  const accountId = process.env.OPERATOR_ID;
  const privateKeyHex = process.env.PRIVATE_KEY;

  if (!accountId || !privateKeyHex) {
    throw new Error("Missing OPERATOR_ID or PRIVATE_KEY in .env file");
  }

  // Create Hedera client for testnet
  const client = Client.forTestnet();

  // Use ECDSA key (HEX-encoded)
  const privateKey = PrivateKey.fromStringECDSA(privateKeyHex);
  client.setOperator(accountId, privateKey);

  console.log("Deploying from account:", accountId);

  try {
    // Locate compiled contract artifact
    const contractPath = path.join(
      process.cwd(),
      "artifacts",
      "contracts",
      "RewardPayout.sol",
      "RewardPayout.json"
    );

    if (!fs.existsSync(contractPath)) {
      throw new Error("Contract artifact not found. Run 'npx hardhat compile' first.");
    }

    const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));
    const bytecode = contractJson.bytecode;

    console.log("📄 Creating file transaction for bytecode...");

    // Upload bytecode to Hedera File Service
    const fileCreateTx = new FileCreateTransaction()
      .setContents(bytecode)
      .setMaxTransactionFee(new Hbar(10)); // increased fee to avoid precheck issues

    const fileCreateSubmit = await fileCreateTx.execute(client);
    const fileCreateRx = await fileCreateSubmit.getReceipt(client);
    const bytecodeFileId = fileCreateRx.fileId;

    console.log("✅ Bytecode file ID:", bytecodeFileId.toString());
    console.log("📦 Creating contract...");

    // Deploy contract from bytecode
    const contractCreateTx = new ContractCreateTransaction()
      .setBytecodeFileId(bytecodeFileId)
      .setGas(2_000_000)
      .setMaxTransactionFee(new Hbar(20)); // increased fee

    const contractCreateSubmit = await contractCreateTx.execute(client);
    const contractCreateRx = await contractCreateSubmit.getReceipt(client);
    const contractId = contractCreateRx.contractId;
    const contractAddress = contractId.toSolidityAddress();

    console.log("🎉 Contract deployed successfully!");
    console.log("Contract ID:", contractId.toString());
    console.log("Contract Address:", `0x${contractAddress}`);
    console.log("Transaction ID:", contractCreateSubmit.transactionId.toString());
    console.log("Explorer URL:", `https://hashscan.io/testnet/contract/${contractId.toString()}`);

  } catch (error) {
    console.error("❌ Deployment failed:");
    console.error(error);
  } finally {
    client.close();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script error:", error);
    process.exit(1);
  });
