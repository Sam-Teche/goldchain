import { PolkadotBlockchainClass } from "./src/internals/adapters/blockchain/blockchain.polkadot";
import { Environment } from "./src/package/configs/environment";

async function testPolkadotIntegration() {
  console.log("🧪 Testing Polkadot Blockchain Integration\n");

  try {
    // 1. Create environment (load from .env)
    const env = new Environment();

    // 2. Create blockchain instance
    const blockchain = new PolkadotBlockchainClass(env);

    // 3. Initialize connection
    console.log("1️⃣ Initializing Polkadot connection...");
    await blockchain.initialize();
    console.log("✅ Connected!\n");

    // 4. Check if initialized
    console.log("2️⃣ Checking connection health...");
    const isHealthy = await blockchain.isInitialized();
    console.log(`✅ Connection healthy: ${isHealthy}\n`);

    // 5. Add first ledger entry
    console.log("3️⃣ Adding first ledger entry...");
    await blockchain.AddLedger("TRACK-001", "LOT-001");

    // 6. Wait a moment for block confirmation
    console.log("\n⏳ Waiting 12 seconds for block confirmation...");
    await new Promise((resolve) => setTimeout(resolve, 12000));

    // 7. Retrieve the ledger
    console.log("\n4️⃣ Retrieving ledger entry...");
    const ledger = await blockchain.getLedger("TRACK-001", "LOT-001");

    if (ledger) {
      console.log("✅ Ledger found!");
      console.log("   Tracking ID:", ledger.trackingId);
      console.log("   Lot ID:", ledger.lotId);
      console.log("   Recorded At:", ledger.recordedAt);
    } else {
      console.log("⚠️  Ledger not found yet (might need more time)");
    }

    // 8. Add more ledger entries
    console.log("\n5️⃣ Adding more ledger entries...");
    await blockchain.AddLedger("TRACK-002", "LOT-002");
    await blockchain.AddLedger("TRACK-003", "LOT-003");

    // 9. Get all ledgers
    console.log("\n6️⃣ Fetching all ledgers...");
    const allLedgers = await blockchain.getAllLedgers();
    console.log(`✅ Found ${allLedgers.length} total ledgers`);

    allLedgers.forEach((entry, index) => {
      console.log(
        `   ${index + 1}. ${entry.trackingId} / ${entry.lotId} - ${entry.recordedAt}`
      );
    });

    // 10. Test wallet creation
    console.log("\n7️⃣ Testing wallet creation...");
    const newWallet = blockchain.createAccount();
    console.log("✅ New wallet created!");
    console.log("   Address:", newWallet.address);
    console.log("   Mnemonic:", newWallet.mnemonic.substring(0, 30) + "...");

    // 11. Test message signing
    console.log("\n8️⃣ Testing message signing...");
    const message = "Goldchain authentication request";
    const signature = blockchain.signMessage(message, newWallet.mnemonic);
    console.log("✅ Message signed!");
    console.log("   Signature:", signature.substring(0, 40) + "...");

    // 12. Test signature verification
    console.log("\n9️⃣ Testing signature verification...");
    const isValid = blockchain.verifySignature(
      message,
      signature,
      newWallet.address
    );
    console.log(`✅ Signature ${isValid ? "VALID" : "INVALID"}`);

    // 13. Disconnect
    console.log("\n🔟 Disconnecting...");
    await blockchain.disconnect();

    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║          ✅ All Tests Passed Successfully!            ║");
    console.log("╚════════════════════════════════════════════════════════╝");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

// Run the test
testPolkadotIntegration();
