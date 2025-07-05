import { SideShiftHttpHandler } from '../sideShiftHttpClient';
import { ApiResponse, RecentShift, ShiftResponse } from '../../types';

export class ShiftsAPI {
    constructor(private sideShiftHttpHandler: SideShiftHttpHandler) {}

    /**
     * Returns whether or not the user is allowed to create shifts on SideShift.ai.
     * @see https://docs.sideshift.ai/endpoints/v2/permissions
     *
     * @param endUserIp - Optional end-user IP address for integrations API requests
     * @returns Promise<ApiResponse<boolean[]>>
     */
    async getPermissions(endUserIp?: string): Promise<ApiResponse<boolean>> {
        return this.sideShiftHttpHandler.execute<boolean>(
            'GET',
            '/permissions',
            {},
            endUserIp ? { userIp: endUserIp } : {}
        );
    }

    /**
     * Returns the shift data.
     * @see https://docs.sideshift.ai/endpoints/v2/shift
     *
     * @param shiftId - The ID of the shift to retrieve.
     * @returns Promise<ApiResponse<ShiftResponse>>
     */
    async getShift(shiftId: string): Promise<ApiResponse<ShiftResponse>> {
        return this.sideShiftHttpHandler.execute<ShiftResponse>('GET', `/shifts/${shiftId}`);
    }

    /**
     * Returns the shift data for every shiftId listed in the array.
     * @see https://docs.sideshift.ai/endpoints/v2/bulkshifts
     *
     * @param shiftIds - An array of shift IDs to retrieve.
     * @returns Promise<ApiResponse<ShiftResponse[]>>
     */
    async getBulkShifts(shiftIds: string[]): Promise<ApiResponse<ShiftResponse[]>> {
        if (shiftIds.length === 0) {
            return { success: false, data: null, error: 'No shift IDs provided', status: 400 };
        }

        const params = new URLSearchParams();
        params.append('ids', shiftIds.join(','));

        return this.sideShiftHttpHandler.execute<ShiftResponse[]>('GET', '/shifts', params);
    }

    /**
     * Returns the 10 most recent completed shifts
     * @see https://docs.sideshift.ai/endpoints/v2/recentshifts
     *
     * @param limit - The maximum number of recent shifts to return (default is 10, max is 100).
     * @returns Promise<ApiResponse<RecentShift[]>>
     */
    async getRecentShifts(limit: number = 10): Promise<ApiResponse<RecentShift[]>> {
        if (limit <= 0 || limit > 100) {
            return {
                success: false,
                data: null,
                error: 'Limit must be between 1 and 100',
                status: 400,
            };
        }

        const params = new URLSearchParams();
        params.append('limit', limit.toString());

        return this.sideShiftHttpHandler.execute<RecentShift[]>('GET', '/recent-shifts', params);
    }
}
