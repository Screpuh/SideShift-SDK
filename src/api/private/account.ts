import { SideShiftHttpHandler } from '../sideShiftHttpClient';
import { ApiResponse, Account } from '../../types';

export class AccountAPI {
    constructor(private sideShiftHttpHandler: SideShiftHttpHandler) {}

    /**
     * Returns the data related to an account.
     * @see https://docs.sideshift.ai/endpoints/v2/account
     *
     * @returns Promise<ApiResponse<Account>>
     */
    async getAccount(): Promise<ApiResponse<Account>> {
        return this.sideShiftHttpHandler.execute<Account>('GET', '/account', {}, { auth: true });
    }
}
