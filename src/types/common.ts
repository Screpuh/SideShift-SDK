// Categories for rate limiting
export type RateCategory = 'shift' | 'quote' | 'default';

// Rate limit configuration per category
export interface RateConfig {
    shift: number;
    quote: number;
    default: number;
}

// Configuration for the SideShift client
export interface SideShiftConfig {
    baseUrl: string;
    maxRequest: RateConfig;
    privateKey: string; // x-sideshift-secret
    affiliateId: string; // passed as affiliateId in requests
    verbose?: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    error?: string;
    status?: number;
}

export interface RateState {
    count: number;
    windowStart: number;
}

export interface RateMap {
    shift: RateState;
    quote: RateState;
    default: RateState;
}

export interface ExecuteOptions {
    auth?: boolean;
    affiliateId?: boolean;
    userIp?: string;
    category?: RateCategory;
    data?: any; // For POST requests
}

export type HttpMethod = 'GET' | 'POST';
