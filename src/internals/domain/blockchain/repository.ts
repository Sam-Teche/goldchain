import { Admin, AdminFilter, IAdmin } from "../admin/admin";

export interface BlockchainRepository {
  AddLedger(trackingId: string, lotId: string): Promise<void>;
  getLedger?(trackingId: string, lotId: string): Promise<any>;
  getAllLedgers?(): Promise<any[]>;
  isInitialized?(): Promise<boolean>;
  initialize?(): Promise<void>;
  disconnect?(): Promise<void>;
}