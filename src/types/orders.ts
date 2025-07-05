import { Shift } from './shifts';

export interface Quote {
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

export interface QuoteBody {
    depositCoin: string;
    depositNetwork?: string;
    settleCoin: string;
    settleNetwork?: string;
    depositAmount: string | null; // if null, settleAmount is required
    settleAmount: string | null; // if null, depositAmount is required
}

export interface FixedShift extends Shift {
    depositMemo?: string;
    settleMemo?: string;
    quoteId: string;
    depositAmount: string;
    settleAmount: string;
    externalId?: string;
    rate: string;
}

export interface FixedShiftBody {
    settleAddress: string;
    settleMemo?: string;
    quoteId: string;
    refundAddress?: string;
    refundMemo?: string;
    externalId?: string; // is an optional field that can be used to pass an integration's own ID to the API.
}

export interface VariableShift extends Shift {
    depositMemo?: string;
    settleMemo?: string;
    externalId?: string;
    settleCoinNetworkFee: string;
    networkFeeUsd: string;
}

export interface VariableShiftBody {
    settleAddress: string;
    settleMemo?: string;
    refundAddress?: string;
    refundMemo?: string;
    depositCoin: string;
    settleCoin: string;
    depositNetwork?: string; // required for non-native tokens (e.g. AXS, USDT) and multi-network native tokens (e.g. ETH).
    settleNetwork?: string; // required for non-native tokens (e.g. AXS, USDT) and multi-network native tokens (e.g. ETH).
    externalId?: string; // integrations own ID
}

export interface RefundAddressFixedShiftResponse extends Shift {
    depositMemo?: string;
    settleMemo?: string;
    quoteId: string;
    depositAmount: string;
    settleAmount: string;
    rate: string;
}

export interface RefundAddressVariableShiftResponse extends Shift {
    depositMemo?: string;
    settleMemo?: string;
}

export type SetRefundAddressResponse =
    | RefundAddressFixedShiftResponse
    | RefundAddressVariableShiftResponse;
