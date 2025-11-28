import {Ledger, LedgerFilter, AddLedgerParameters} from "./ledger";


export interface LedgerRepository {
    AddLedger: (ledger: AddLedgerParameters) => Promise<void>
    UpdateLedger: (ledgerId: string, ledger: Partial<Ledger>) => Promise<void>
    DeleteLedger: (ledgerId: string) => Promise<void>
    GetLedgers: (filter: LedgerFilter) => Promise<Ledger[]>
    GetLedger: (ledgerId?: string, reference?: string) => Promise<Ledger>
    GetLedgerAnalytics: (accountId: string) => Promise<{ totalTransactions: number; totalSales: number }>
}