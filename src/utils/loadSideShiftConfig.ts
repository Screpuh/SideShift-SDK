import dotenv from 'dotenv';
import { RateConfig, SideShiftConfig } from '../types';
dotenv.config();

export function loadSideShiftConfig(): SideShiftConfig {
    const baseUrl = process.env.SIDESHIFT_BASE_URL || 'https://sideshift.ai/api/v2';
    const privateKey = process.env.SIDESHIFT_PRIVATE_KEY || '';
    const affiliateId = process.env.SIDESHIFT_AFFILIATE_ID || '';

    const maxRequest: RateConfig = {
        shift: 5,
        quote: 20,
        default: parseInt(process.env.SIDESHIFT_RATE_LIMIT || '60', 10),
    };

    const verbose = process.env.SIDESHIFT_VERBOSE === 'true' ? true : false;

    return {
        baseUrl,
        privateKey,
        affiliateId,
        maxRequest,
        verbose,
    };
}
