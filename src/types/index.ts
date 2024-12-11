export interface ApiConfig {
    apiKey: string;
    baseUrl: string;
    apiVersion: string;
    maxRequestsPerMinute: number;
}

export interface RateLimitInfo {
    requestCount: number;
    lastResetTime: number;
}

export interface ApiResponse<T> {
    data: T | null;
    error: ApiError | null;
    metadata: {
        timestamp: number;
    };
}

export interface ApiError {
    code: string;
    message: string;
    details?: unknown;
}

export interface RateLimiter {
    requestCount: number;
    lastResetTime: number;
}

export interface Coin {
    networks: string[];
    coin: string;
    name: string;
    hasMemo: boolean;
    mainnet: string;
    network: string[];
    fixedOnly: string[] | boolean;
    variableOnly: string[] | boolean;
    tokenDetails: {
        network: {
            contractAdress: string;
            decimals: number;
        };
    };
    depostOffline: string[] | boolean;
    settleOffline: string[] | boolean;
}

export interface CoinIcon {
    url: string;
    type: string;
}

export interface Permission {
    createShift: boolean;
}

export interface Pair {
    min: string;
    max: string;
    rate: string;
    depositCoint: string;
    settleCoin: string;
    depositNetwork: string;
    settleNetwork: string;
}

export interface RecentShift {
    createdAt: string;
    depositCoin: string;
    depositNetwork: string;
    depositAmount: string;
    settleCoin: string;
    settleNetwork: string;
    settleAmount: string;
}

export interface XaiStats {
    totalSupply: number;
    circulatingSupply: number;
    numberOfStakers: number;
    latestAnnualPercentageYield: string;
    latestDistributedXai: string;
    totalStaked: string;
    averageAnnualPercentageYield: string;
    totalValueLocked: string;
    totalValueLockedRatio: string;
    xaiPriceUsd: string;
    svxaiPriceUsd: string;
    svxaiPriceXai: string;
}

export interface Account {
    id: string;
    lifetimeStakingRewards: string;
    unstaking: string;
    staked: string;
    available: string;
    totalBalance: string;
}

export interface Shift {
    id: string;
    createdAt: string;
    depositCoin: string;
    settleCoin: string;
    depositNetwork: string;
    settleNetwork: string;
    depositAddress: string;
    settleAddress: string;
    depositMin: string;
    depositMax: string;
    refundAddress?: string;
    refundMemo?: string;
    type: string;
    expiresAt: string;
    status: string;
    averageShiftSeconds: string;
    issue?: string;
}

export interface FixedShiftSingle extends Shift {
    quoteId: string;
    depositAmount: string;
    settleAmount?: string;
    externalId?: string;
    updatedAt?: string;
    depositHash?: string;
    settleHash?: string;
    depositReceivedAt?: string;
    rate: string;
}

export interface VariableShiftSingle extends Shift {
    depositAmount: string;
    settleAmount?: string;
    externalId?: string;
    updatedAt?: string;
    depositHash?: string;
    settleHash?: string;
    depositReceivedAt?: string;
    rate?: string;
    settleCoinNetworkFee?: string;
}

export interface FixedShiftMultiple extends Shift {
    quoteId: string;
    deposits: {
        updatedAt: string;
        depositHash: string;
        settleHash?: string;
        depositReceivedAt: string;
        depositAmount: string;
        settleAmount?: string;
        rate?: string;
        status: string;
    }[];
}

export interface VariableShiftMultiple extends Shift {
    deposits: {
        updatedAt: string;
        depositHash: string;
        settleHash?: string;
        depositReceivedAt: string;
        depositAmount: string;
        settleAmount?: string;
        rate?: string;
        status: string;
    }[];
}

export interface RequestQuote {
    id: string;
    createdAt: string;
    depositCoin: string;
    settleCoin: string;
    depositNetwork: string;
    settleNetwork: string;
    expiresAt: string;
    depositAmount: string;
    settleAmount: string;
    rate: string;
    affiliateId?: string;
}

export interface RequestQuoteBody {
    depositCoin: string;
    depositNetwork?: string;
    settleCoin: string;
    settleNetwork?: string;
    depositAmount: string | null;
    settleAmount: string | null;
    affiliateId: string;
}

export interface CreateFixedShiftBody {
    settleAddress: string;
    settleMemo?: string;
    affiliateId: string;
    quoteId: string;
    refundAddress?: string;
    refundMemo?: string;
    externalId?: string;
}

export interface FixedShiftResponse extends Shift {
    depositMemo?: string;
    settleMemo?: string;
    quoteId: string;
    depositAmount: string;
    settleAmount: string;
    externalId?: string;
    rate: string;
}

export interface CreateVariableShiftBody {
    settleAddress: string;
    settleMemo?: string;
    affiliateId: string;
    refundAddress?: string;
    refundMemo?: string;
    depositCoin: string;
    settleCoin: string;
    depositNetwork?: string;
    settleNetwork?: string;
    externalId?: string;
}

export interface VariableShiftResponse extends Shift {
    depositMemo?: string;
    settleMemo?: string;
    externalId?: string;
    settleCoinNetworkFee: string;
    networkFeeUsd: string;
}

export interface SetRefundAddressFixedShiftResponse extends Shift {
    depositMemo?: string;
    settleMemo?: string;
    quoteId: string;
    depositAmount: string;
    settleAmount: string;
    rate: string;
}

export interface SetRefundAddressVariableShiftResponse extends Shift {
    depositMemo?: string;
    settleMemo?: string;
}

export interface SetRefundAddressBody {
    address: string;
    memo?: string;
}

export interface CheckoutResponse {
    id: string;
    settleCoin: string;
    settleNetwork: string;
    settleAddress: string;
    settleMemo?: string;
    settleAmount: string;
    updatedAt: string;
    createdAt: string;
    affiliateId: string;
    successUrl: string;
    cancelUrl: string;
}

export interface CheckoutRequest {
    settleCoin: string;
    settleNetwork: string;
    settleAddress: string;
    settleMemo?: string;
    settleAmount: string;
    affiliateId: string;
    successUrl: string;
    cancelUrl: string;
}
