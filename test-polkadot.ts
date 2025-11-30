import { config } from "dotenv";
config();

import { Environment } from "./src/package/configs/environment";
import { PolkadotBlockchainClass } from "./src/internals/adapters/blockchain/blockchain.polkadot";

async function testPolkadot() {
  console.log("🧪 Testing Polkadot Integration on Local Dev Node\n");

  const env = new Environment();
  const polkadot = new PolkadotBlockchainClass(env);

  try {
    // 1. Initialize connection
    console.log("1️⃣ Initializing Polkadot connection...");
    await polkadot.initialize();
    console.log("✅ Connected!\n");

    // 2. Add a ledger entry with unique ID
    console.log("2️⃣ Adding first ledger entry...");
    const trackingId1 = `TRACK-${Date.now()}`;
    const lotId1 = `LOT-${Date.now()}`;
    await polkadot.AddLedger(trackingId1, lotId1);
    console.log(`✅ Added: ${trackingId1}, ${lotId1}\n`);

    // Small delay to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 3. Add another entry
    console.log("3️⃣ Adding second ledger entry...");
    const trackingId2 = `TRACK-${Date.now()}`;
    const lotId2 = `LOT-${Date.now()}`;
    await polkadot.AddLedger(trackingId2, lotId2);
    console.log(`✅ Added: ${trackingId2}, ${lotId2}\n`);

    // Small delay to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 3. Add another entry
    console.log("3️⃣ Adding second ledger entry...");
    const trackingId3 = `TRACK-${Date.now()}`;
    const lotId3 = `LOT-${Date.now()}`;
    await polkadot.AddLedger(trackingId3, lotId3);
    console.log(`✅ Added: ${trackingId3}, ${lotId3}\n`);

    // 4. Get all ledgers
    console.log("4️⃣ Getting all ledgers...");
    const allLedgers = await polkadot.getAllLedgers();
    console.log(`✅ Found ${allLedgers.length} ledgers:`);
    allLedgers.forEach((ledger, index) => {
      console.log(
        `  ${index + 1}. ${ledger.trackingId} | ${ledger.lotId} | ${ledger.recordedAt}`
      );
    });

    console.log("\n🎉 All tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
  } finally {
    await polkadot.disconnect();
  }
}

testPolkadot();
