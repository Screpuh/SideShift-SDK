import { SideShiftHttpHandler } from '../sideShiftHttpClient';
import { ApiResponse, Coin } from '../../types';

export class CoinsAPI {
    constructor(private sideShiftHttpHandler: SideShiftHttpHandler) {}

    /**
     * Returns the list of coins and their respective networks available on SideShift.ai.
     *
     * Note: The fields fixedOnly, variableOnly, depositOffline, settleOffline will
     * return false if false for every network. true for single network assets
     * and an array of networks for mixed.
     *
     * @see https://docs.sideshift.ai/endpoints/v2/coins
     * @returns Promise<ApiResponse<Coin[]>>
     */
    async getCoins(): Promise<ApiResponse<Coin[]>> {
        return this.sideShiftHttpHandler.execute<Coin[]>('GET', '/coins');
    }

    /**
     * Returns the icon of the coin in svg or png format.
     * @see https://docs.sideshift.ai/endpoints/v2/coinicon
     *
     * @param coinNetwork - The coin-network. Network can be ommitted (e.g., 'btc-mainnet' or 'btc')
     * @returns Promise<ApiResponse<string>>
     */
    async getCoinIcon(coinNetwork: string): Promise<ApiResponse<string>> {
        return this.sideShiftHttpHandler.execute<string>('GET', `/coins/icon/${coinNetwork}`);
    }
}
