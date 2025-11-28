import { config } from "dotenv";
config();

import { Environment } from "./src/package/configs/environment";
import { PolkadotBlockchainClass } from "./src/internals/adapters/blockchain/blockchain.polkadot";

async function testPolkadot() {
  console.log("🧪 Testing Polkadot Integration on Westend Testnet\n");

  const env = new Environment();
  const polkadot = new PolkadotBlockchainClass(env);

  try {
    // 1. Initialize connection
    console.log("1️⃣ Initializing Polkadot connection...");
    await polkadot.initialize();
    console.log("✅ Connected!\n");

    // 2. Add a ledger entry
    console.log("2️⃣ Adding first ledger entry...");
    await polkadot.AddLedger("TRACK-001", "LOT-001");

    // 3. Add another entry
    console.log("3️⃣ Adding second ledger entry...");
    await polkadot.AddLedger("TRACK-002", "LOT-002");

    // 4. Get all ledgers
    console.log("4️⃣ Getting all ledgers...");
    const allLedgers = await polkadot.getAllLedgers();
    console.log(`✅ Found ${allLedgers.length} ledgers:`, allLedgers);

    console.log("\n🎉 All tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    if (error instanceof Error && error.message.includes("balance")) {
      console.log(
        "\n💡 Get testnet tokens from: https://faucet.polkadot.io/westend"
      );
    }
  } finally {
    await polkadot.disconnect();
  }
}

testPolkadot();
