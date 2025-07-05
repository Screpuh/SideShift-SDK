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

export interface RecentShift {
    createdAt: string;
    depositCoin: string;
    depositNetwork: string;
    depositAmount: string;
    settleCoin: string;
    settleNetwork: string;
    settleAmount: string;
}

export type ShiftResponse =
    | FixedShiftSingle
    | VariableShiftSingle
    | FixedShiftMultiple
    | VariableShiftMultiple;
