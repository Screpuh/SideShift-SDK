import { SideShiftHttpHandler } from '../../../api/sideShiftHttpClient';
import { SideShiftConfig } from '../../../types';
import axios from 'axios';
import { ShiftsAPI } from '../../../api/public/shifts';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CoinsAPI', () => {
    let client: SideShiftHttpHandler;
    let shiftsAPI: ShiftsAPI;
    let config: SideShiftConfig;
    let mockAxiosInstance: jest.Mocked<any>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockAxiosInstance = {
            get: jest.fn(),
            post: jest.fn(),
        };

        mockedAxios.create.mockReturnValue(mockAxiosInstance);

        config = {
            baseUrl: 'https://api.example.com',
            privateKey: 'test-key',
            affiliateId: 'test-affiliate',
            maxRequest: {
                shift: 10,
                quote: 60,
                default: 30,
            },
            verbose: false,
        };

        client = new SideShiftHttpHandler(config);
        shiftsAPI = new ShiftsAPI(client);
    });

    describe('getPermissions', () => {
        it('should call /permissions with correct user IP', async () => {
            const userIp = '12.34.56.78';
            mockAxiosInstance.get.mockResolvedValue({ data: {} });
            const result = await shiftsAPI.getPermissions(userIp);

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/permissions', {
                headers: { 'x-user-ip': userIp },
                params: {},
            });
            expect(result).toBeDefined();
        });
    });

    describe('getShift', () => {
        it('should call /shifts/:id with correct shift ID', async () => {
            const shiftId = 'test-shift-id';
            const mockResponse = { data: { id: shiftId, status: 'completed' } };
            mockAxiosInstance.get.mockResolvedValue(mockResponse);
            const result = await shiftsAPI.getShift(shiftId);

            expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/shifts/${shiftId}`, {
                headers: {},
                params: undefined,
            });
            expect(result).toBeDefined();
        });
    });

    describe('getBulkShifts', () => {
        it('should call /shifts with correct shift IDs', async () => {
            const shiftIds = ['shift1', 'shift2'];
            const mockResponse = { data: [{ id: 'shift1' }, { id: 'shift2' }] };
            mockAxiosInstance.get.mockResolvedValue(mockResponse);
            const result = await shiftsAPI.getBulkShifts(shiftIds);
            const expectedParams = new URLSearchParams();
            expectedParams.append('ids', 'shift1,shift2');

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/shifts', {
                headers: {},
                params: expectedParams,
            });
            expect(result).toBeDefined();
        });

        it('should return error if no shift IDs provided', async () => {
            const result = await shiftsAPI.getBulkShifts([]);
            expect(result.success).toBe(false);
            expect(result.error).toBe('No shift IDs provided');
        });
    });

    describe('getRecentShifts', () => {
        it('should call /recent-shifts with correct limit', async () => {
            const limit = 5;
            const mockResponse = { data: [{ id: 'shift1' }, { id: 'shift2' }] };
            mockAxiosInstance.get.mockResolvedValue(mockResponse);
            const result = await shiftsAPI.getRecentShifts(limit);
            const expectedParams = new URLSearchParams();
            expectedParams.append('limit', limit.toString());

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/recent-shifts', {
                headers: {},
                params: expectedParams,
            });
            expect(result).toBeDefined();
        });

        it('should return error if limit is out of range', async () => {
            const result = await shiftsAPI.getRecentShifts(101);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Limit must be between 1 and 100');
        });
    });
});
