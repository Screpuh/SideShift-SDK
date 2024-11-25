import {
    Account,
    ApiConfig,
    ApiResponse,
    Coin,
    CoinIcon,
    CreateFixedShiftBody,
    CreateVariableShiftBody,
    FixedShiftMultiple,
    FixedShiftResponse,
    FixedShiftSingle,
    Pair,
    Permission,
    RateLimitInfo,
    RecentShift,
    RequestQuote,
    RequestQuoteBody,
    SetRefundAddressBody,
    SetRefundAddressFixedShiftResponse,
    SetRefundAddressVariableShiftResponse,
    VariableShiftResponse,
    VariableShiftSingle,
    XaiStats,
} from './types';

export class SideShiftClient {
    private config: ApiConfig;
    private rateLimiter: Record<string, RateLimitInfo> = {};

    constructor(accountId: string, apiKey: string) {
        this.config = {
            baseUrl: 'https://sideshift.ai',
            apiVersion: 'v2',
            maxRequestsPerMinute: 60,
            accountId: accountId,
            apiKey: apiKey,
        };
    }

    public async request<T>(
        method: string,
        endpoint: string,
        data?: unknown,
        customHeaders?: HeadersInit
    ): Promise<ApiResponse<T>> {
        try {
            await this.checkRateLimit(endpoint);

            const url = new URL('/api/' + this.config.apiVersion + endpoint, this.config.baseUrl);
            const headers = this.mergeHeaders(this.createHeaders(), customHeaders);
            const options: RequestInit = {
                method,
                headers: headers,
                body: data ? JSON.stringify(data) : undefined,
            };

            const response = await fetch(url, options);

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

    private async checkRateLimit(endpoint: string): Promise<void> {
        let limit = this.config.maxRequestsPerMinute;
        limit = endpoint === '/shifts/fixed' || endpoint === '/shifts/variable' ? 5 : limit;
        limit = endpoint === '/quotes' ? 20 : limit;
        const now = Date.now();
        const oneMinute = 60 * 1000;

        // Initialize rate limiter info for the endpoint if it doesn't exist
        if (!this.rateLimiter[endpoint]) {
            this.rateLimiter[endpoint] = {
                requestCount: 0,
                lastResetTime: now,
            };
        }

        const rateLimitInfo = this.rateLimiter[endpoint];

        // Reset request count if a minute has passed since the last reset
        if (now - rateLimitInfo.lastResetTime >= oneMinute) {
            rateLimitInfo.requestCount = 0;
            rateLimitInfo.lastResetTime = now;
        }

        // Check if the current request exceeds the rate limit for the endpoint
        if (rateLimitInfo.requestCount >= limit) {
            throw new Error(`Rate limit exceeded for ${endpoint}. Please try again later.`);
        }

        // Increment the request count for the current endpoint
        rateLimitInfo.requestCount++;
    }

    private createHeaders(): HeadersInit {
        return {
            'Content-Type': 'application/json',
        };
    }

    private mergeHeaders(defaultHeaders: HeadersInit, customHeaders?: HeadersInit): HeadersInit {
        return { ...defaultHeaders, ...customHeaders };
    }

    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        const timestamp = Date.now();

        try {
            if (!response.ok) {
                const errorDetails = await response.json();
                throw new Error(
                    `Error ${response.status}: ${errorDetails.error.message || 'An error occurred'}`
                );
            }

            const contentType = response.headers.get('content-type');

            let data: T | null = null;

            if (contentType?.includes('application/json')) {
                data = await response.json();
            } else if (contentType?.includes('image/svg')) {
                data = { url: await response.text(), type: 'svg' } as unknown as T;
            } else if (contentType?.includes('image/png')) {
                const pngBuffer = await response.arrayBuffer();

                data = { url: pngBuffer, type: 'png' } as unknown as T;
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
     * @returns Coin[]
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
    public getCoinIcon(coin: string, network?: string): Promise<ApiResponse<CoinIcon>> {
        const customHeaders = { Accept: 'image/svg+xml' };
        const param = coin + (network ? `-${network}` : '');
        return this.get<CoinIcon>(`/coins/icon/${param}`, customHeaders);
    }

    /**
     * Returns whether or not the user is allowed to create shifts on SideShift.ai.
     *
     * @param ip (ip address of the user)
     * @returns
     */
    public getPermissions(ip: string): Promise<ApiResponse<Permission>> {
        const customHeaders = { 'x-user-ip': ip };
        return this.get<Permission>('/permissions', customHeaders);
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
    public getShift(
        id: string
    ): Promise<
        ApiResponse<
            FixedShiftSingle | VariableShiftSingle | FixedShiftMultiple | FixedShiftMultiple
        >
    > {
        return this.get<
            FixedShiftSingle | VariableShiftSingle | FixedShiftMultiple | FixedShiftMultiple
        >(`/shifts/${id}`);
    }

    /**
     * Returns the shift data for every shiftId listed in the query string.
     *
     * @param ids
     * @returns
     */
    public getBulkShifts(
        ids: string[]
    ): Promise<
        ApiResponse<
            FixedShiftSingle[] | VariableShiftSingle[] | FixedShiftMultiple[] | FixedShiftMultiple[]
        >
    > {
        return this.get<
            FixedShiftSingle[] | VariableShiftSingle[] | FixedShiftMultiple[] | FixedShiftMultiple[]
        >(`/shifts?ids=${ids.join(',')}`);
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
        const customHeaders = { 'x-sideshift-secret': `${this.config.apiKey}` };
        return this.get<Account>('/account', customHeaders);
    }

    /**
     * For fixed rate shifts, a quote should be requested first.
     * A quote can be requested for either a depositAmount or a settleAmount.
     *
     * @returns
     */
    public postRequestQuote(
        body: RequestQuoteBody,
        ip: string
    ): Promise<ApiResponse<RequestQuote>> {
        const customHeaders = { 'x-sideshift-secret': `${this.config.apiKey}`, 'x-user-ip': ip };
        return this.post<RequestQuote>('/quotes', body, customHeaders);
    }

    /**
     * After requesting a quote, use the quoteId to create a fixed rate shift with the quote.
     *
     * @param body
     * @param ip
     * @returns
     */
    public postCreateFixedShift(
        body: CreateFixedShiftBody,
        ip: string
    ): Promise<ApiResponse<FixedShiftResponse>> {
        const customHeaders = { 'x-sideshift-secret': `${this.config.apiKey}`, 'x-user-ip': ip };
        return this.post<FixedShiftResponse>('/shifts/fixed', body, customHeaders);
    }

    /**
     * For variable rate shifts, the settlement rate is determined when the user's deposit is received.
     *
     * @param body
     * @param ip
     * @returns
     */
    public postCreateVariableShift(
        body: CreateVariableShiftBody,
        ip: string
    ): Promise<ApiResponse<VariableShiftResponse>> {
        const customHeaders = { 'x-sideshift-secret': `${this.config.apiKey}`, 'x-user-ip': ip };

        return this.post<VariableShiftResponse>('/shifts/variable', body, customHeaders);
    }

    /**
     * For shifts, a refund address can be set after the shift has been created.
     *
     * @param body
     * @param shiftId
     * @returns
     */
    public postSetRefundAddress(
        body: SetRefundAddressBody,
        shiftId: string
    ): Promise<
        ApiResponse<SetRefundAddressFixedShiftResponse | SetRefundAddressVariableShiftResponse>
    > {
        const customHeaders = { 'x-sideshift-secret': `${this.config.apiKey}`, shiftId: shiftId };

        return this.post<
            SetRefundAddressFixedShiftResponse | SetRefundAddressVariableShiftResponse
        >('/shifts/fixed/multiple', body, customHeaders);
    }

    public async get<T>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
        return this.request<T>('GET', endpoint, undefined, headers);
    }

    public async post<T>(
        endpoint: string,
        data: unknown,
        headers?: HeadersInit
    ): Promise<ApiResponse<T>> {
        return this.request<T>('POST', endpoint, data, headers);
    }

    public async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
        return this.request<T>('PUT', endpoint, data);
    }

    public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>('DELETE', endpoint);
    }
}
