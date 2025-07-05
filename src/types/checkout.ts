export interface Checkout {
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

export interface CheckoutBody {
    settleCoin: string;
    settleNetwork: string;
    settleAddress: string;
    settleMemo?: string;
    settleAmount: string;
    successUrl: string;
    cancelUrl: string;
}
