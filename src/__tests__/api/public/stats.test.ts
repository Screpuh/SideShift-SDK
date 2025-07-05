import { SideShiftConfig } from '../../../types';
import axios from 'axios';
import { StatsAPI } from '../../../api/public';
import { SideShiftHttpHandler } from '../../../api/sideShiftHttpClient';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('StatsAPI', () => {
    let client: SideShiftHttpHandler;
    let statsAPI: StatsAPI;
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
        statsAPI = new StatsAPI(client);
    });

    describe('Stats API Integration', () => {
        it('should call /xai/stats', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: {} });

            const result = await statsAPI.getXaiStats();

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/xai/stats', {
                headers: {},
                params: undefined,
            });

            expect(result).toBeDefined();
        });
    });
});
