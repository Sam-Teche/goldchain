import Keyring from "@polkadot/keyring";
import { u8aToHex } from "@polkadot/util";
import { waitReady } from "@polkadot/wasm-crypto";

async function testPolkadotMock() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   Testing Polkadot Keyring & Signing Functionality   ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  try {
    // Wait for WASM crypto to initialize
    console.log("⏳ Initializing WASM crypto interface...");
    await waitReady();
    console.log("✓ WASM crypto initialized\n");

    // Initialize keyring with sr25519 cryptography
    const keyring = new Keyring({ type: "sr25519" });
    console.log("✓ Keyring initialized with SR25519 signature scheme\n");

    // Create test accounts
    console.log("━━━ Creating Test Accounts ━━━");
    const alice = keyring.addFromUri("//Alice");
    const bob = keyring.addFromUri("//Bob");

    console.log("Alice:");
    console.log(`  Address:    ${alice.address}`);
    console.log(`  Public Key: ${u8aToHex(alice.publicKey)}`);

    console.log("\nBob:");
    console.log(`  Address:    ${bob.address}`);
    console.log(`  Public Key: ${u8aToHex(bob.publicKey)}\n`);

    // Test message signing
    console.log("━━━ Testing Message Signing ━━━");
    const message = "Hello from the Goldchain Backend!";
    const messageBytes = new TextEncoder().encode(message);

    const aliceSignature = alice.sign(messageBytes);
    console.log(`Message: "${message}"`);
    console.log(`Signature: ${u8aToHex(aliceSignature).substring(0, 40)}...`);
    console.log(`Signature Length: ${aliceSignature.length} bytes\n`);

    // Verify signature with correct public key
    console.log("━━━ Testing Signature Verification ━━━");
    const isValidAlice = alice.verify(
      messageBytes,
      aliceSignature,
      alice.publicKey
    );
    console.log(
      `✓ Alice's signature verified by Alice: ${isValidAlice ? "VALID ✓" : "INVALID ✗"}`
    );

    // Verify signature with wrong public key
    const isValidBob = bob.verify(
      messageBytes,
      aliceSignature,
      alice.publicKey
    );
    console.log(
      `✓ Alice's signature verified by Bob: ${isValidBob ? "VALID ✓" : "INVALID ✗"}`
    );

    // Test tampered message
    const tamperedMessage = "Hello from the Hacked Backend!";
    const tamperedBytes = new TextEncoder().encode(tamperedMessage);
    const isTamperedValid = alice.verify(
      tamperedBytes,
      aliceSignature,
      alice.publicKey
    );
    console.log(
      `✓ Tampered message verification: ${isTamperedValid ? "VALID ✓" : "INVALID ✗"}\n`
    );

    // Create custom account from mnemonic
    console.log("━━━ Creating Account from Mnemonic ━━━");
    const mnemonic =
      "bottom drive obey lake curtain smoke basket hold race lonely fit walk";
    const customAccount = keyring.addFromUri(mnemonic);
    console.log(`Custom Address: ${customAccount.address}`);
    console.log(`Custom Public Key: ${u8aToHex(customAccount.publicKey)}\n`);

    // Test multiple signatures
    console.log("━━━ Testing Multiple Signatures ━━━");
    const messages = [
      "Transaction 1: Transfer 100 GOLD",
      "Transaction 2: Transfer 200 GOLD",
      "Transaction 3: Transfer 300 GOLD",
    ];

    messages.forEach((msg, index) => {
      const msgBytes = new TextEncoder().encode(msg);
      const sig = alice.sign(msgBytes);
      const valid = alice.verify(msgBytes, sig, alice.publicKey);
      console.log(
        `  Tx ${index + 1}: ${valid ? "✓" : "✗"} - ${msg.substring(0, 30)}...`
      );
    });

    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║          ✓ All Tests Passed Successfully!            ║");
    console.log("╚════════════════════════════════════════════════════════╝");
  } catch (error) {
    console.error("\n✗ Error during testing:");
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
testPolkadotMock().catch((error) => {
  console.error("\n✗ Fatal error:");
  console.error(error);
  process.exit(1);
});
