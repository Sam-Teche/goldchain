import { ApiPromise, WsProvider, HttpProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import { Keyring } from "@polkadot/keyring";
import { KeyringPair } from "@polkadot/keyring/types";
import { BlockchainRepository } from "../../domain/blockchain/repository";
import { Environment } from "../../../package/configs/environment";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { WeightV2 } from "@polkadot/types/interfaces";
import contractAbi from "./goldchain_sc.json";

export class PolkadotBlockchainClass implements BlockchainRepository {
  private api!: ApiPromise;
  private contract!: ContractPromise;
  private adminAccount!: KeyringPair;
  private keyring!: Keyring;
  private environmentVariables: Environment;
  private isConnected: boolean = false;
  private contractAddress!: string;

  constructor(environmentVariables: Environment) {
    this.environmentVariables = environmentVariables;
    this.contractAddress = environmentVariables.Polkadot.contractAddress;
  }

  /**
   * Initialize connection (matches Solana's constructor setup)
   */
  async initialize(): Promise<void> {
    if (this.isConnected) {
      console.log("✅ Polkadot already connected");
      return;
    }

    try {
      console.log("🔗 Connecting to Polkadot...");
      console.log("📡 RPC:", this.environmentVariables.Polkadot.rpcURL);

      // Wait for crypto to be ready
      await cryptoWaitReady();

      // Detect if URL is HTTP or WebSocket
      const isHttp =
        this.environmentVariables.Polkadot.rpcURL.startsWith("http");

      let provider;
      if (isHttp) {
        console.log("📡 Using HTTP provider");
        provider = new HttpProvider(this.environmentVariables.Polkadot.rpcURL);
      } else {
        console.log("📡 Using WebSocket provider");
        provider = new WsProvider(
          this.environmentVariables.Polkadot.rpcURL,
          1000
        );
      }

      // Create API
      this.api = await ApiPromise.create({
        provider,
        throwOnConnect: false,
        noInitWarn: true,
      });

      await this.api.isReady;

      const [chain, nodeName, nodeVersion] = await Promise.all([
        this.api.rpc.system.chain(),
        this.api.rpc.system.name(),
        this.api.rpc.system.version(),
      ]);

      console.log("✅ Connected to Polkadot");
      console.log(`⛓️  Chain: ${chain.toString()}`);
      console.log(`📦 Node: ${nodeName.toString()} v${nodeVersion.toString()}`);

      // Initialize keyring (matches Solana's keypair setup)
      this.keyring = new Keyring({ type: "sr25519" });
      this.adminAccount = this.keyring.addFromMnemonic(
        this.environmentVariables.Polkadot.secretKeyMnemonic
      );

      console.log(`🔑 Admin Address: ${this.adminAccount.address}`);

      // Initialize contract connection (matches Solana's program setup)
      this.contract = new ContractPromise(
        this.api,
        contractAbi,
        this.contractAddress
      );

      console.log(`📄 Contract Address: ${this.contractAddress}`);

      // Check balance
      const accountInfo: any = await this.api.query.system.account(
        this.adminAccount.address
      );
      const freeBalance = accountInfo.data.free.toBigInt();
      const decimals = this.api.registry.chainDecimals[0] || 12;
      const balanceInMainUnit = Number(freeBalance) / Math.pow(10, decimals);

      console.log(
        `💰 Balance: ${balanceInMainUnit.toFixed(4)} ${this.api.registry.chainTokens[0] || "UNIT"}`
      );

      if (freeBalance === 0n) {
        console.warn("\n⚠️  WARNING: Zero balance!");
      }

      this.isConnected = true;
    } catch (error) {
      console.error("❌ Failed to connect to Polkadot:", error);
      throw new Error(`Polkadot connection failed: ${error}`);
    }
  }

  /**
   * Initialize contract (matches Solana's initialize function)
   * Must be called once before using the contract
   */
  async initializeContract(): Promise<string> {
    if (!this.isConnected) {
      throw new Error("❌ Not connected. Call initialize() first.");
    }

    console.log("Initializing contract...");

    try {
      // Estimate gas with max limit for query
      const maxGasLimit = this.api.registry.createType("WeightV2", {
        refTime: 10000000000n,
        proofSize: 131072n,
      }) as WeightV2;

      // Call initialize on contract to get gas estimation
      const { gasRequired, storageDeposit, result } =
        await this.contract.query.initialize(this.adminAccount.address, {
          gasLimit: maxGasLimit,
          storageDepositLimit: null,
        });

      if (result.isErr) {
        throw new Error(`Contract query failed: ${result.asErr}`);
      }

      // Use actual gasRequired with 20% buffer
      const gasLimit = this.api.registry.createType("WeightV2", {
        refTime: (gasRequired.refTime.toBigInt() * 120n) / 100n,
        proofSize: (gasRequired.proofSize.toBigInt() * 120n) / 100n,
      }) as WeightV2;

      // Send actual transaction
      return new Promise((resolve, reject) => {
        this.contract.tx
          .initialize({ gasLimit, storageDepositLimit: null })
          .signAndSend(this.adminAccount, ({ status, dispatchError }) => {
            if (status.isInBlock) {
              console.log(`📦 In block: ${status.asInBlock.toHex()}`);
            }

            if (status.isFinalized) {
              if (dispatchError) {
                if (dispatchError.isModule) {
                  const decoded = this.api.registry.findMetaError(
                    dispatchError.asModule
                  );
                  reject(
                    new Error(
                      `${decoded.section}.${decoded.name}: ${decoded.docs}`
                    )
                  );
                } else {
                  reject(new Error(dispatchError.toString()));
                }
              } else {
                const txHash = status.asFinalized.toHex();
                console.log("✅ Initialize transaction signature:", txHash);
                resolve(txHash);
              }
            }
          })
          .catch(reject);
      });
    } catch (error) {
      console.error("❌ Initialize failed:", error);
      throw error;
    }
  }

  /**
   * Add ledger entry (matches Solana's AddLedger exactly)
   * Only admin can call this
   */
  async AddLedger(trackingId: string, lotId: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error("❌ Not connected. Call initialize() first.");
    }

    console.log(`📝 Adding ledger entry: ${trackingId}, ${lotId}`);

    try {
      // Estimate gas with max limit for query
      const maxGasLimit = this.api.registry.createType("WeightV2", {
        refTime: 10000000000n,
        proofSize: 131072n,
      }) as WeightV2;

      // Dry run to check if it will work and get gas estimation
      const { gasRequired, storageDeposit, result } =
        await this.contract.query.addLedger(
          this.adminAccount.address,
          { gasLimit: maxGasLimit, storageDepositLimit: null },
          trackingId,
          lotId
        );

      if (result.isErr) {
        const error = result.asErr;
        if (error.isModule) {
          const decoded = this.api.registry.findMetaError(error.asModule);
          throw new Error(`Contract error: ${decoded.name}`);
        }
        throw new Error(`Contract query failed: ${error}`);
      }

      // Use actual gasRequired with 20% buffer
      const gasLimit = this.api.registry.createType("WeightV2", {
        refTime: (gasRequired.refTime.toBigInt() * 120n) / 100n,
        proofSize: (gasRequired.proofSize.toBigInt() * 120n) / 100n,
      }) as WeightV2;

      // Send actual transaction
      const txHash = await new Promise<string>((resolve, reject) => {
        let txHashHex: string = "";

        this.contract.tx
          .addLedger({ gasLimit, storageDepositLimit: null }, trackingId, lotId)
          .signAndSend(
            this.adminAccount,
            ({ status, dispatchError, txHash }) => {
              // Store transaction hash
              if (!txHashHex) {
                txHashHex = txHash.toHex();
              }

              if (status.isInBlock) {
                console.log(`📦 In block: ${status.asInBlock.toHex()}`);
              }

              if (status.isFinalized) {
                if (dispatchError) {
                  if (dispatchError.isModule) {
                    const decoded = this.api.registry.findMetaError(
                      dispatchError.asModule
                    );
                    reject(
                      new Error(
                        `${decoded.section}.${decoded.name}: ${decoded.docs}`
                      )
                    );
                  } else {
                    reject(new Error(dispatchError.toString()));
                  }
                } else {
                  console.log("✅ Add ledger transaction:", txHashHex);
                  resolve(txHashHex);
                }
              }
            }
          )
          .catch(reject);
      });

      console.log("✅ Ledger added successfully! Transaction:", txHash);
    } catch (error) {
      console.error("❌ Add ledger failed:", error);
      throw error;
    }
  }

  /**
   * Get ledger by tracking_id and lot_id (matches Solana's getLedger)
   */
  async getLedger(trackingId: string, lotId: string): Promise<any> {
    if (!this.isConnected) {
      throw new Error("❌ Not connected. Call initialize() first.");
    }

    try {
      const gasLimit = this.api.registry.createType("WeightV2", {
        refTime: 10000000000n,
        proofSize: 131072n,
      }) as WeightV2;

      const { result, output } = await this.contract.query.getLedger(
        this.adminAccount.address,
        { gasLimit, storageDepositLimit: null },
        trackingId,
        lotId
      );

      if (result.isErr) {
        console.error("❌ Failed to fetch ledger:", result.asErr);
        return null;
      }

      const ledgerData = output?.toPrimitive() as any;

      // Check if wrapped in Ok/None
      if (!ledgerData || !ledgerData.ok) {
        return null;
      }

      // Extract from Ok wrapper
      const ledger = ledgerData.ok;

      return {
        trackingId: ledger.trackingId,
        lotId: ledger.lotId,
        recordedAt: new Date(Number(ledger.recordedAt)),
      };
    } catch (error) {
      console.error("❌ Failed to fetch ledger:", error);
      return null;
    }
  }

  /**
   * Get config (admin address) - matches Solana's getConfig
   */
  async getConfig(): Promise<any> {
    if (!this.isConnected) {
      throw new Error("❌ Not connected. Call initialize() first.");
    }

    try {
      const gasLimit = this.api.registry.createType("WeightV2", {
        refTime: 100000000000n,
        proofSize: 524288n,
      }) as WeightV2;

      const { result, output } = await this.contract.query.getConfig(
        this.adminAccount.address,
        { gasLimit, storageDepositLimit: null }
      );

      if (result.isErr) {
        console.error("❌ Failed to fetch config:", result.asErr);
        return null;
      }

      const configData = output?.toHuman() as any;

      // Check if it's wrapped in Ok/None
      if (!configData || configData === "None" || !configData.Ok) {
        return null;
      }

      // Extract from Ok wrapper
      return {
        admin: configData.Ok.admin,
      };
    } catch (error) {
      console.error("❌ Failed to fetch config:", error);
      return null;
    }
  }

  /**
   * Check if contract is initialized (matches Solana's isInitialized)
   */
  async isInitialized(): Promise<boolean> {
    const config = await this.getConfig();
    return config !== null;
  }

  // Get all ledgers (new function to fetch all ledger entries)
  async getAllLedgers(): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error("❌ Not connected. Call initialize() first.");
    }

    try {
      const gasLimit = this.api.registry.createType("WeightV2", {
        refTime: 10000000000n,
        proofSize: 131072n,
      }) as WeightV2;

      const { result, output } = await this.contract.query.getAllLedgers(
        this.adminAccount.address,
        { gasLimit, storageDepositLimit: null }
      );

      if (result.isErr) {
        console.error("❌ Failed to fetch all ledgers:", result.asErr);
        return [];
      }

      const ledgersData = output?.toPrimitive() as any;

      // Check if wrapped in Ok
      if (!ledgersData || !ledgersData.ok) {
        return [];
      }

      // Extract array from Ok wrapper
      const ledgers = ledgersData.ok;

      if (!Array.isArray(ledgers) || ledgers.length === 0) {
        return [];
      }

      // Convert to proper format
      return ledgers.map((ledger: any) => ({
        trackingId: ledger.trackingId,
        lotId: ledger.lotId,
        recordedAt: new Date(Number(ledger.recordedAt)),
      }));
    } catch (error) {
      console.error("❌ Failed to fetch all ledgers:", error);
      return [];
    }
  }

  async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect();
      this.isConnected = false;
      console.log("🔌 Disconnected from Polkadot");
    }
  }
}
