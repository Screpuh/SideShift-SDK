import { SideShiftHttpHandler } from '../sideShiftHttpClient';
import { ApiResponse, Pair } from '../../types';

export class PairsAPI {
    constructor(private sideShiftHttpHandler: SideShiftHttpHandler) {}

    /**
     * Returns the minimum and maximum deposit amount and the rate for a pair of coins.
     * @see https://docs.sideshift.ai/endpoints/v2/pair
     *
     * From and to can be coin-network or if network is omitted, it will default to the mainnet.
     *
     * @param from - The coin-network to shift from. (e.g., 'btc-mainnet' or 'btc')
     * @param to - The coin-network to shift to.
     * @param amount - Without specifying an amount, the system will assume a deposit value of 500 USD.
     * @returns
     */
    async getPair(from: string, to: string, amount?: number): Promise<ApiResponse<Pair>> {
        return this.sideShiftHttpHandler.execute<Pair>(
            'GET',
            `/pair/${from}/${to}`,
            amount ? { amount } : {},
            {
                auth: true,
                affiliateId: true,
            }
        );
    }

    /**
     * Returns the minimum and maximum deposit amount and the rate for every possible pair of coins
     * listed in the query string.
     * @see https://docs.sideshift.ai/endpoints/v2/pairs
     *
     * @param pairs - Each coin should be in the format 'coin-network' (e.g., [btc-mainnet,usdc-bsc,bch,eth]).
     * @returns Promise<ApiResponse<Pair[]>>
     */
    async getPairs(coins: string[]): Promise<ApiResponse<Pair[]>> {
        if (!coins || coins.length === 0) {
            throw new Error('Coins cannot be empty. Please provide at least one coin.');
        }
        return this.sideShiftHttpHandler.execute<Pair[]>(
            'GET',
            '/pairs',
            {
                pairs: coins.join(','),
            },
            {
                auth: true,
                affiliateId: true,
            }
        );
    }
}
