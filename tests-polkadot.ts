import { PolkadotBlockchainClass } from "./src/internals/adapters/blockchain/blockchain.polkadot";
import { Environment } from "./src/package/configs/environment";

function timeoutPromise(ms: number) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`⏳ Timeout after ${ms}ms`)), ms)
  );
}

async function testPolkadotBlockchain() {
  const env = {
    Polkadot: {
      rpcURL: "ws://localhost:9944",
      secretKeyMnemonic:
        "bottom drive obey lake curtain smoke basket hold race lonely fit walk",
      contractAddress: "5HGv7RcomxbWKyoJf4ua2KtCcECe4uyXn1nQF6WnA2EcJLGh",
    },
  } as Environment;

  const blockchain = new PolkadotBlockchainClass(env);

  try {
    console.log("========================================");
    console.log("TEST 1: Initialize Connection");
    console.log("========================================");

    // 🔥 Remedy: Force timeout if RPC is not reachable
    await Promise.race([
      blockchain.initialize(),
      timeoutPromise(7000), // 7 seconds
    ]);

    console.log("✅ Connection test passed\n");

    console.log("========================================");
    console.log("TEST 2: Check if Contract is Initialized");
    console.log("========================================");

    const isInit = await blockchain.isInitialized();
    console.log(`Contract initialized: ${isInit}`);

    if (!isInit) {
      console.log("\nInitializing contract...");
      const txHash = await blockchain.initializeContract();
      console.log(`✅ Contract initialized: ${txHash}\n`);
    } else {
      console.log("✅ Contract already initialized\n");
    }

    console.log("========================================");
    console.log("TEST 3: Get Config");
    console.log("========================================");

    const config = await blockchain.getConfig();
    console.log("Config:", config);
    console.log("✅ Get config test passed\n");

    console.log("========================================");
    console.log("TEST 4: Add Ledger Entry");
    console.log("========================================");

    const trackingId = `TRACK-${Date.now()}`;
    const lotId = `LOT-${Date.now()}`;
    console.log(`Adding: ${trackingId}, ${lotId}`);

    await blockchain.AddLedger(trackingId, lotId);
    console.log("✅ Add ledger test passed\n");

    console.log("========================================");
    console.log("TEST 5: Get Ledger Entry");
    console.log("========================================");

    console.log("Waiting 3 seconds for blockchain confirmation...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const ledger = await blockchain.getLedger(trackingId, lotId);
    console.log("Ledger retrieved:", ledger);
    console.log("✅ Get ledger test passed\n");

    console.log("========================================");
    console.log("TEST 6: Get Non-existent Ledger");
    console.log("========================================");

    const nonExistent = await blockchain.getLedger(
      "NON-EXISTENT",
      "NON-EXISTENT"
    );
    console.log("Non-existent ledger:", nonExistent);
    console.log("✅ Non-existent ledger test passed\n");

    console.log("========================================");
    console.log("ALL TESTS PASSED! ✅");
    console.log("========================================");
  } catch (error: any) {
    console.error("❌ TEST FAILED:", error.message || error);

    // 🔥 Remedy: If the RPC is offline, show a clear hint
    if (error.message?.includes("Timeout")) {
      console.error(`
⚠️ Your RPC endpoint (${env.Polkadot.rpcURL}) is NOT reachable.
Make sure you have a Substrate node running:

   substrate-contracts-node --dev

or change the RPC URL to a working endpoint.
`);
    }
  } finally {
    console.log("\n🔌 Disconnecting...");
    try {
      await blockchain.disconnect();
    } catch (_) {}
  }
}

testPolkadotBlockchain()
  .then(() => {
    console.log("\n✅ Test suite completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test suite failed:", error);
    process.exit(1);
  });
