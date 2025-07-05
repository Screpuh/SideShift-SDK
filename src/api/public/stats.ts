import { SideShiftHttpHandler } from '../sideShiftHttpClient';
import { ApiResponse, XaiStats } from '../../types';

export class StatsAPI {
    constructor(private sideShiftHttpHandler: SideShiftHttpHandler) {}

    /**
     * Returns the statistics about XAI coin, including it's current USD price.
     * @see https://docs.sideshift.ai/endpoints/v2/xai-stats
     *
     * @returns Promise<ApiResponse<XaiStats>>
     */
    async getXaiStats(): Promise<ApiResponse<XaiStats>> {
        return this.sideShiftHttpHandler.execute<XaiStats>('GET', '/xai/stats');
    }
}
