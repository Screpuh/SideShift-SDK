import { SideShiftHttpHandler } from '../sideShiftHttpClient';
import { ApiResponse, Checkout } from '../../types';

export class CheckoutAPI {
    constructor(private sideShiftHttpHandler: SideShiftHttpHandler) {}

    /**
     * Returns the data of a checkout created using /v2/checkout endpoint.
     * @see https://docs.sideshift.ai/endpoints/v2/checkout
     *
     * @param checkoutId - The ID of the checkout to retrieve.
     * @returns Promise<ApiResponse<Checkout>>
     */
    async getCheckout(checkoutId: string): Promise<ApiResponse<Checkout>> {
        return this.sideShiftHttpHandler.execute<Checkout>('GET', `/checkout/${checkoutId}`);
    }
}
