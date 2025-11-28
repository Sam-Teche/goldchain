export type PartyRole = "broker" | "buyer" | "seller";

export type ItemType = "domain_name" | "broker_fee" | "general_merchandise" | "services" | "other";

export type Currency = "usd" | "eur" | "gbp" | "cad" | "aud";

export type Visibility = {
    hidden_from?: string[];
}

export type Party = {
    role: PartyRole;
    customer: string;
    visibility?: Visibility;
}

export type Schedule = {
    amount: number;
    payer_customer: string;
    beneficiary_customer: string;
}

export type ExtraAttributes = {
    [key: string]: any;
    with_content?: boolean;
}

export type TransactionItem = {
    title?: string;
    description?: string;
    type: ItemType;
    inspection_period?: number;
    quantity?: number;
    extra_attributes?: ExtraAttributes;
    visibility?: Visibility;
    schedule: Schedule[];
}

export type CreateTransactionRequest = {
    parties: Party[];
    currency: Currency;
    description: string;
    items: TransactionItem[];
}

export type CreateTransactionResponse = {
    id?: string;
    status?: string;
    created_date?: string;
}


