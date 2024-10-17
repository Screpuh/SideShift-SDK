import { Account, ApiConfig, ApiResponse, Coin, CoinIcon, CreateFixedShiftBody, CreateVariableShiftBody, FixedShiftMultiple, FixedShiftResponse, FixedShiftSingle, Pair, Permission, RateLimiter, RecentShift, RequestQuote, RequestQuoteBody, SetRefundAddressBody, SetRefundAddressFixedShiftResponse, SetRefundAddressVariableShiftResponse, Shift, VariableShiftResponse, VariableShiftSingle, XaiStats } from './types';

export class SideShiftClient {
    private config: ApiConfig;
    private rateLimiter: RateLimiter;

    constructor(config: ApiConfig) {
        this.config = config;
        this.rateLimiter = {
            requestCount: 0,
            lastResetTime: Date.now(),
        };
    }

    public async request<T>(
        method: string,
        endpoint: string,
        data?: unknown,
        headers?: Headers
    ): Promise<ApiResponse<T>> {
        try {
            await this.checkRateLimit();
            const url = new URL('/api/' + this.config.apiVersion + endpoint, this.config.baseUrl);
            console.log('URL: ', url);
            const options: RequestInit = {
                method,
                headers: headers ? headers : this.createHeaders(),
                body: data ? JSON.stringify(data) : undefined,
            };

            console.log('Options: ', options.headers);

            const response = await fetch(url, options);
            console.log('Raw response: ', response);
            return await this.handleResponse<T>(response);
        } catch (error) {
            return {
                data: null,
                error: {
                    code: 'ERR_REQUEST_FAILED',
                    message: error instanceof Error ? error.message : 'Request failed',
                },
                metadata: {
                    timestamp: Date.now(),
                },
            };
        }
    }

    private async checkRateLimit(): Promise<void> {
        const now = Date.now();
        const oneMinute = 60 * 1000;

        if (now - this.rateLimiter.lastResetTime >= oneMinute) {
            this.rateLimiter.requestCount = 0;
            this.rateLimiter.lastResetTime = now;
        }

        if (this.rateLimiter.requestCount >= this.config.maxRequestsPerMinute) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }

        this.rateLimiter.requestCount++;
    }

    private createHeaders(): Headers {
        return new Headers({
            'Content-Type': 'application/json',
            //'x-sideshift-secret': `${this.config.apiKey}`,
        });
    }

    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        const timestamp = Date.now();

        try {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');

            let data: T | null = null;

            if (contentType?.includes('application/json')) {
                data = await response.json();
            } else if (contentType?.includes('image/svg')) {
                data = (await response.text()) as T;
            } else if (contentType?.includes('image/png')) {
                data = (await response.blob()) as T;
            } else {
                throw new Error('Unsupported content type: ' + contentType);
            }

            return {
                data,
                error: null,
                metadata: { timestamp },
            };
        } catch (error) {
            return {
                data: null,
                error: {
                    code: `ERR_${response.status || 'UNKNOWN'}`,
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                },
                metadata: { timestamp },
            };
        }
    }

    /**
     * Returns the list of coins and their respective networks available on SideShift.ai.
     * 
     * @returns 
     */
    public getCoins(): Promise<ApiResponse<Coin[]>> {
        return this.get<Coin[]>('/coins');
    }

    /**
     * Returns the icon of the coin in svg or png format.
     * 
     * @param coin_network 
     * @returns 
     */
    public getCoinIcon(coin_network: string): Promise<ApiResponse<CoinIcon>> {
        const acceptImageHeader = new Headers({
            'Accept' : 'image/svg+xml',
        });
        return this.get<CoinIcon>(`/coins/icon/${coin_network}`, acceptImageHeader);
    }

    /**
     * Returns whether or not the user is allowed to create shifts on SideShift.ai.
     * 
     * @param ip (ip address of the user)
     * @returns 
     */
    public getPermissions(ip: string): Promise<ApiResponse<Permission>> {
        const checkPermissionHeader = new Headers({
            'Content-Type': 'application/json',
            'x-user-ip': ip,
        });
        return this.get<Permission>('/permissions', checkPermissionHeader);
    }

    /**
     * Returns the minimum and maximum deposit amount and the rate for a pair of coins.
     * 
     * @param from (coin-network, if network is omitted, it will default to the mainnet)
     * @param to (coin-network, if network is omitted, it will default to the mainnet)
     * @returns 
     */
    public getPair(from: string, to: string, amount?: number): Promise<ApiResponse<Pair>> {
        let url = `/pair/${from}/${to}`;
        if (amount) {
            url += `?amount=${amount}`;
        }
        return this.get<Pair>(url);
    }

    /**
     * Returns the minimum and maximum deposit amount and the rate for every possible pair of coins listed in the query string.
     * 
     * @param pairs (comma separated list of pairs)
     * @returns 
     */
    public getPairs(pairs: string): Promise<ApiResponse<Pair[]>> {
        return this.get<Pair[]>('/pairs?pairs=' + pairs);
    }

    /**
     * Returns the shift data.
     * 
     * @param shiftId 
     * @returns 
     */
    public getShift(id: string): Promise<ApiResponse<FixedShiftSingle | VariableShiftSingle | FixedShiftMultiple | FixedShiftMultiple>> {
        return this.get<FixedShiftSingle | VariableShiftSingle | FixedShiftMultiple | FixedShiftMultiple>(`/shifts/${id}`);
    }

    /**
     * Returns the shift data for every shiftId listed in the query string.
     * 
     * @param ids 
     * @returns 
     */
    public getBulkShifts(ids: string[]): Promise<ApiResponse<FixedShiftSingle[] | VariableShiftSingle[] | FixedShiftMultiple[] | FixedShiftMultiple[]>> {
        return this.get<FixedShiftSingle[] | VariableShiftSingle[] | FixedShiftMultiple[] | FixedShiftMultiple[]>(`/shifts?ids=${ids.join(',')}`);
    }

    /**
     * Returns the 10 most recent completed shifts.
     * 
     * @returns 
     */
    public getRecentShifts(limit?: number): Promise<ApiResponse<RecentShift[]>> {
        const url = limit ? `/recent-shifts?limit=${limit}` : '/recent-shifts';
        return this.get<RecentShift[]>(url);
    }

    /**
     * Returns the statistics about XAI coin, including it's current USD price.
     * 
     * @returns 
     */
    public getXAIStats(): Promise<ApiResponse<XaiStats>> {
        return this.get<XaiStats>('/xai/stats');
    }

    /**
     * Returns the data related to an account.
     * 
     * @returns 
     */
    public getAccount(): Promise<ApiResponse<Account>> {
        const accountHeader = new Headers({
            'Content-Type': 'application/json',
            'x-sideshift-secret': `${this.config.apiKey}`,
        });
        return this.get<Account>('/account', accountHeader);
    }

    /**
     * For fixed rate shifts, a quote should be requested first.
     * A quote can be requested for either a depositAmount or a settleAmount.
     * 
     * @returns 
     */
    public postRequestQuote(body: RequestQuoteBody, ip: string): Promise<ApiResponse<RequestQuote>> {
        const postRequestHeader = new Headers({
            'Content-Type': 'application/json',
            'x-user-ip': ip,
            'x-sideshift-secret': `${this.config.apiKey}`,
        });
        return this.post<RequestQuote>('/quotes', body, postRequestHeader);
    }

    /**
     * After requesting a quote, use the quoteId to create a fixed rate shift with the quote.
     * 
     * @param body 
     * @param ip 
     * @returns 
     */
    public postCreateFixedShift(body: CreateFixedShiftBody, ip: string): Promise<ApiResponse<FixedShiftResponse>> {
        const postCreateFixedShiftHeader = new Headers({
            'Content-Type': 'application/json',
            'x-user-ip': ip,
            'x-sideshift-secret': `${this.config.apiKey}`,
        });
        return this.post<FixedShiftResponse>('/shifts/fixed', body, postCreateFixedShiftHeader);
    }

    /**
     * For variable rate shifts, the settlement rate is determined when the user's deposit is received.
     * 
     * @param body 
     * @param ip 
     * @returns 
     */
    public postCreateVariableShift(body: CreateVariableShiftBody, ip: string): Promise<ApiResponse<VariableShiftResponse>> {
        const postCreateVariableShiftHeader = new Headers({
            'Content-Type': 'application/json',
            'x-user-ip': ip,
            'x-sideshift-secret': `${this.config.apiKey}`,
        });
        return this.post<VariableShiftResponse>('/shifts/variable', body, postCreateVariableShiftHeader);
    }


    /**
     * For shifts, a refund address can be set after the shift has been created.
     * 
     * @param body 
     * @param shiftId 
     * @returns 
     */
    public postSetRefundAddress(body: SetRefundAddressBody, shiftId: string): Promise<ApiResponse<SetRefundAddressFixedShiftResponse | SetRefundAddressVariableShiftResponse>> {
        const postCreateFixedShiftMultipleHeader = new Headers({
            'Content-Type': 'application/json',
            'shiftId': shiftId,
            'x-sideshift-secret': `${this.config.apiKey}`,
        });
        return this.post<SetRefundAddressFixedShiftResponse | SetRefundAddressVariableShiftResponse>('/shifts/fixed/multiple', body, postCreateFixedShiftMultipleHeader);
    }


    public async get<T>(endpoint: string, headers?: Headers): Promise<ApiResponse<T>> {
        return this.request<T>('GET', endpoint, undefined, headers);
    }

    public async post<T>(endpoint: string, data: unknown, headers?: Headers): Promise<ApiResponse<T>> {
        return this.request<T>('POST', endpoint, data, headers);
    }

    public async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
        return this.request<T>('PUT', endpoint, data);
    }

    public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>('DELETE', endpoint);
    }
}
