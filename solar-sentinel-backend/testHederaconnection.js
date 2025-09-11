// Load environment variables from .env
require("dotenv").config();
const { Client, AccountBalanceQuery } = require("@hashgraph/sdk");

(async () => {
  try {
    const operatorId = process.env.OPERATOR_ID;
    const operatorKey = process.env.OPERATOR_KEY;

    if (!operatorId || !operatorKey) {
      throw new Error("Missing OPERATOR_ID or OPERATOR_KEY in .env");
    }

    // Connect to Hedera Testnet
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    // Try fetching account balance
    const balance = await new AccountBalanceQuery()
      .setAccountId(operatorId)
      .execute(client);

    console.log(`✅ Connection successful!`);
    console.log(`💰 Account balance: ${balance.hbars.toString()}`);
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  }
})();
