import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
    ApiResponse,
    ExecuteOptions,
    HttpMethod,
    RateCategory,
    RateMap,
    SideShiftConfig,
} from '../types';

export class SideShiftHttpHandler {
    private axiosInstance: AxiosInstance;
    private config: SideShiftConfig;
    private rateMap: RateMap = {
        shift: { count: 0, windowStart: Date.now() },
        quote: { count: 0, windowStart: Date.now() },
        default: { count: 0, windowStart: Date.now() },
    };

    constructor(config: SideShiftConfig) {
        this.config = config;
        this.axiosInstance = axios.create({
            baseURL: config.baseUrl,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    public async execute<T>(
        method: HttpMethod,
        endpoint: string,
        params?: Record<string, any>,
        options: ExecuteOptions = {}
    ): Promise<ApiResponse<T>> {
        try {
            this.checkRateLimit(options.category);

            const headers = this.buildHeaders(options.auth, options.userIp);

            if (options.affiliateId) {
                if (!this.config.affiliateId) {
                    throw new Error(
                        'Affiliate ID is required but not provided in the configuration.'
                    );
                }
                if (!params) {
                    params = {};
                }
                params.affiliateId = this.config.affiliateId;
            }

            const requestConfig: AxiosRequestConfig = { headers };

            let response: AxiosResponse<T>;

            if (method === 'POST') {
                const postData = options.data || {};
                if (params && params.affiliateId) {
                    postData.affiliateId = params.affiliateId;
                    delete params.affiliateId;
                }
                requestConfig.params = params;
                response = await this.axiosInstance.post<T>(endpoint, postData, requestConfig);
            } else {
                requestConfig.params = params;
                response = await this.axiosInstance.get<T>(endpoint, requestConfig);
            }

            if (this.config.verbose) {
                console.log('=== [Debug] HTTP Response ===');
                console.log(`${method} ${endpoint}:`, {
                    status: response.status,
                    data: response.data,
                });
                console.log('=========================');
            }

            return {
                success: true,
                data: response.data,
                status: response.status,
            };
        } catch (error) {
            return this.handleError<T>(error, method, endpoint);
        }
    }

    private handleError<T>(error: any, method: string, endpoint: string): ApiResponse<T> {
        let status: number | undefined;
        let message = `${method} ${endpoint} failed`;

        if (axios.isAxiosError(error)) {
            status = error.response?.status;

            if (error.response) {
                const statusText = error.response.statusText;
                const code = error.response.status;
                const data = error.response.data;

                let details = '';

                if (typeof data === 'string') {
                    details = data;
                } else if (data?.error?.message) {
                    details = data.error.message;
                } else {
                    try {
                        details = JSON.stringify(data);
                    } catch {
                        details = String(data);
                    }
                }

                message = `${method} ${endpoint} failed: ${code} ${statusText} - ${details}`;
            } else if (error.request) {
                message = `${method} ${endpoint} failed: No response received`;
            } else {
                message = `${method} ${endpoint} failed: ${error.message}`;
            }
        } else {
            message = `${method} ${endpoint} failed: ${error?.message || 'Unknown error'}`;
        }

        if (this.config.verbose) {
            console.log('=== [Debug] HTTP Error ===');
            console.error('Error:', message);
            console.log('==========================');
        }

        return {
            success: false,
            data: null,
            error: message,
            status,
        };
    }

    private buildHeaders(auth = false, userIp?: string): Record<string, string> {
        const headers: Record<string, string> = {};
        if (auth) {
            headers['x-sideshift-secret'] = this.config.privateKey;
        }
        if (userIp) {
            headers['x-user-ip'] = userIp;
        }
        if (this.config.verbose) {
            console.log('=== [Debug] HTTP Headers ===');
            console.log('Request headers:', headers);
            console.log('=========================');
        }
        return headers;
    }

    private checkRateLimit(category?: RateCategory) {
        if (!category) {
            category = 'default';
        }
        const now = Date.now();
        const limits = this.config.maxRequest;

        if (!this.rateMap) {
            this.rateMap = {
                shift: { count: 0, windowStart: now },
                quote: { count: 0, windowStart: now },
                default: { count: 0, windowStart: now },
            };
        }

        const state = this.rateMap[category];

        const windowMs = 60 * 1000;
        if (now - state.windowStart >= windowMs) {
            state.count = 0;
            state.windowStart = now;
        }

        if (this.config.verbose) {
            console.log('=== [Debug] Rate Limit Check ===');
            console.log(`Rate limit for ${category}:`, {
                count: state.count,
                windowStart: new Date(state.windowStart).toISOString(),
                limits: limits[category],
            });
            console.log('=========================');
        }

        state.count += 1;
        if (state.count > limits[category]) {
            throw new Error(
                `Rate limit exceeded for ${category} (max ${limits[category]} per minute)`
            );
        }
    }
}
