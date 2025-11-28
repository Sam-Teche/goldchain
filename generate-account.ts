import { Keyring } from "@polkadot/keyring";
import { mnemonicGenerate } from "@polkadot/util-crypto";
import { cryptoWaitReady } from "@polkadot/util-crypto";

async function generateAccount() {
  await cryptoWaitReady();

  // Generate new mnemonic
  const mnemonic = mnemonicGenerate();
  console.log("\n🔐 Your New Polkadot Account:\n");
  console.log("Mnemonic (SAVE THIS!):");
  console.log(mnemonic);
  console.log("\n");

  // Create account from mnemonic
  const keyring = new Keyring({ type: "sr25519" });
  const account = keyring.addFromMnemonic(mnemonic);

  console.log("Address:", account.address);
  console.log("\n📝 Add this to your .env file:");
  console.log(`POLKADOT_SECRET_MNEMONIC=${mnemonic}`);
  console.log("\n💰 Get free testnet tokens:");
  console.log("1. Go to: https://faucet.polkadot.io/westend");
  console.log("2. Paste your address:", account.address);
  console.log("3. Click 'Submit' to get free WND tokens");
  console.log(
    "\n⏳ Wait 1-2 minutes for tokens to arrive, then run your test!\n"
  );
}

generateAccount();
