import { SideShiftHttpHandler } from '../sideShiftHttpClient';
import { ApiResponse, Checkout, CheckoutBody } from '../../types';
export class CreateCheckoutAPI {
    constructor(private sideShiftHttpHandler: SideShiftHttpHandler) {}

    /**
     * Creates a new checkout that can be used to facilitate payment for merchants.
     * @see https://docs.sideshift.ai/endpoints/v2/createcheckout
     *
     * @returns Promise<ApiResponse<Checkout>>
     */
    async postCreateCheckout(body: CheckoutBody, userIp?: string): Promise<ApiResponse<Checkout>> {
        return this.sideShiftHttpHandler.execute<Checkout>(
            'POST',
            '/checkout',
            {},
            { auth: true, affiliateId: true, data: body, userIp }
        );
    }
}
