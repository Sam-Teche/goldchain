export interface FinnHubTradeData {
    c: string[];  // conditions
    p: number;    // price
    s: string;    // symbol
    t: number;    // timestamp
    v: number;    // volume
}

export interface FinnHubMessage {
    type: string;
    data?: FinnHubTradeData[];
}

export interface FinnHubSubscription {
    type: 'subscribe' | 'unsubscribe';
    symbol: string;
}

export interface GoldPriceMessage {
    type: 'gold_price';
    price: number;
    timestamp?: number;
}
