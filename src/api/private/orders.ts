import { SideShiftHttpHandler } from '../sideShiftHttpClient';
import {
    ApiResponse,
    FixedShift,
    FixedShiftBody,
    Quote,
    QuoteBody,
    SetRefundAddressResponse,
    VariableShift,
    VariableShiftBody,
} from '../../types';

export class OrdersAPI {
    constructor(private sideShiftHttpHandler: SideShiftHttpHandler) {}

    /**
     * For fixed rate shifts, a quote should be requested first.
     *
     * A quote can be requested for either a depositAmount or a settleAmount.
     *
     * When defining non-native tokens like AXS and USDT for depositCoin and/or settleCoin,
     * the depositNetwork and settleNetwork fields must also be specified.
     * This also applies to native tokens like ETH that supports multiple networks.
     *
     * commissionRate optional parameter can be used to offer a better rate for your users
     * by reducing the affiliate commission paid by SideShift.
     *
     * If the API requests are sent from the integrations own server, the x-user-ip header
     * must be set to the end-user IP address. Otherwise the requests will be blocked.
     *
     * After the quote request, a fixed rate shift should be created using the `id` returned
     * by the /v2/quotes endpoint.
     *
     * A quote expires after 15 minutes.
     * @see https://docs.sideshift.ai/endpoints/v2/requestquote
     *
     * @param body - The body of the quote request.
     * @param userIp - Optional end-user IP address for integrations API requests
     *
     * @returns Promise<ApiResponse<Account>>
     */
    async postRequestQuote(body: QuoteBody, userIp?: string): Promise<ApiResponse<Quote>> {
        if (!body.depositAmount && !body.settleAmount) {
            throw new Error('At least one of depositAmount or settleAmount must be provided.');
        }

        return this.sideShiftHttpHandler.execute<Quote>(
            'POST',
            '/quotes',
            {},
            {
                auth: true,
                affiliateId: true,
                userIp,
                data: body,
                category: 'quote',
            }
        );
    }

    /**
     * After requesting a quote, use the quoteId to create a fixed rate shift with the quote.
     * The affiliateId must match the one used to request the quote.
     *
     * For fixed rate shifts, a deposit of exactly the amount of depositAmount must be made
     * before the expiresAt timestamp, otherwise the deposit will be refunded.
     *
     * For shifts that return a depositMemo, the deposit transaction must include this memo,
     * otherwise the deposit might be lost.
     *
     * For shifts settling in coins where the network is included in the networksWithMemo
     * array in the /v2/coins endpoint, API users are allowed to specify a settleMemo field,
     * for example "settleMemo": "123343245".
     *
     * refundAddress and refundMemo are optional, if not defined, user will be prompted
     * to enter a refund address manually on the SideShift.ai order page if the shift
     * needs to be refunded.
     * @see https://docs.sideshift.ai/endpoints/v2/createfixedshift
     *
     * @param body - The body of the fixed rate shift request.
     * @param userIp - Optional end-user IP address for integrations API requests
     * @returns
     */
    async postFixedRateShift(
        body: FixedShiftBody,
        userIp?: string
    ): Promise<ApiResponse<FixedShift>> {
        return this.sideShiftHttpHandler.execute<FixedShift>(
            'POST',
            '/shifts/fixed',
            {},
            {
                auth: true,
                affiliateId: true,
                userIp,
                data: body,
                category: 'shift',
            }
        );
    }

    /**
     * For variable rate shifts, the settlement rate is determined when the user's deposit is received.
     *
     * For shifts that return a depositMemo, the deposit transaction must include this memo,
     * otherwise the deposit might be lost.
     *
     * For shifts settling in coins where the network is included in the networksWithMemo
     * array in the /v2/coins, integrations can specify a settleMemo field,
     * for example "settleMemo": "123343245".
     *
     * When defining non-native tokens like AXS and USDT for depositCoin and/or settleCoin,
     * the depositNetwork and settleNetwork fields must also be specified.
     * This also applies to native tokens like ETH that supports multiple networks.
     *
     * @see https://docs.sideshift.ai/endpoints/v2/createvariableshift
     *
     * @param body - The body of the variable rate shift request.
     * @param userIp - Optional end-user IP address for integrations API requests
     * @returns Promise<ApiResponse<VariableShift>>
     */
    async postVariableRateShift(
        body: VariableShiftBody,
        userIp?: string
    ): Promise<ApiResponse<VariableShift>> {
        return this.sideShiftHttpHandler.execute<VariableShift>(
            'POST',
            '/shifts/variable',
            {},
            {
                auth: true,
                affiliateId: true,
                userIp,
                data: body,
                category: 'shift',
            }
        );
    }

    /**
     * Set refund address.
     * @see https://docs.sideshift.ai/endpoints/v2/setrefundaddress
     *
     * @param shiftId - The ID of the shift for which to set the refund address.
     * @param refundAddress - The refund address to set.
     * @param refundMemo - Optional memo for address that requires memo.
     * @return Promise<ApiResponse<SetRefundAddressResponse>>
     */
    async postSetRefundAddress(
        shiftId: string,
        refundAddress: string,
        refundMemo?: string
    ): Promise<ApiResponse<SetRefundAddressResponse>> {
        return this.sideShiftHttpHandler.execute<SetRefundAddressResponse>(
            'POST',
            `/shifts/${shiftId}/set-refund-address`,
            {},
            {
                auth: true,
                data: {
                    refundAddress,
                    refundMemo,
                },
            }
        );
    }

    /**
     * Cancels an existing order after 5 minutes by expiring it.
     * @see https://docs.sideshift.ai/endpoints/v2/cancelorder
     *
     * @param orderId - The ID of the order to cancel.
     * @return Promise<ApiResponse<string>>
     */
    async postCancelOrder(orderId: string): Promise<ApiResponse<string>> {
        return this.sideShiftHttpHandler.execute<string>(
            'POST',
            `/cancel-order`,
            {},
            {
                auth: true,
                data: {
                    orderId,
                },
            }
        );
    }
}
