import {CreateTransactionRequest, CreateTransactionResponse} from "./escrow";

export interface EscrowRepository {
    createTransaction(request: CreateTransactionRequest): Promise<CreateTransactionResponse>;
    cancelTransaction(reference: string, reason: string): Promise<void>;
}