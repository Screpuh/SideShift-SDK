import { SideShiftHttpHandler } from '../../../api/sideShiftHttpClient';
import { CoinsAPI } from '../../../api/public/coins';
import { SideShiftConfig } from '../../../types';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CoinsAPI', () => {
    let client: SideShiftHttpHandler;
    let coinsAPI: CoinsAPI;
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
        coinsAPI = new CoinsAPI(client);
    });

    describe('Coins API Integration', () => {
        it('should call /coins with correct config', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: {} });

            const result = await coinsAPI.getCoins();

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/coins', {
                headers: {},
                params: undefined,
            });

            expect(result).toBeDefined();
        });
    });

    describe('getCoinIcon', () => {
        it('should call /coins/icon/:coinNetwork with correct coin network', async () => {
            const coinNetwork = 'btc-mainnet';
            const mockResponse = { data: '<svg>...</svg>' };
            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await coinsAPI.getCoinIcon(coinNetwork);

            expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/coins/icon/${coinNetwork}`, {
                headers: {},
                params: undefined,
            });

            expect(result).toEqual({
                success: true,
                data: mockResponse.data,
            });
        });
    });
});
