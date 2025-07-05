import { SideShiftHttpHandler } from '../../../api/sideShiftHttpClient';
import { SideShiftConfig } from '../../../types';
import axios from 'axios';
import { PairsAPI } from '../../../api/private';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PairsAPI', () => {
    let client: SideShiftHttpHandler;
    let pairsAPI: PairsAPI;
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
        pairsAPI = new PairsAPI(client);
    });

    describe('getPair', () => {
        it('should call /pair with correct parameters', async () => {
            const fromCoin = 'btc-mainnet';
            const toCoin = 'eth-mainnet';
            const amount = 1000;

            const mockResponse = { data: { fromCoin, toCoin, amount } };
            mockAxiosInstance.get.mockResolvedValue(mockResponse);
            const params: Record<string, any> = {};
            params.amount = amount;
            params.affiliateId = config.affiliateId;

            const result = await pairsAPI.getPair(fromCoin, toCoin, amount);

            expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/pair/${fromCoin}/${toCoin}`, {
                params: params,
                headers: { 'x-sideshift-secret': config.privateKey },
            });
            expect(result).toBeDefined();
        });
    });

    describe('getPairs', () => {
        it('should call /pairs with correct coins', async () => {
            const coins = ['btc-mainnet', 'eth-mainnet'];
            const mockResponse = { data: coins };
            mockAxiosInstance.get.mockResolvedValue(mockResponse);
            const params: Record<string, any> = {};
            params.pairs = coins.join(',');
            params.affiliateId = config.affiliateId;

            const result = await pairsAPI.getPairs(coins);

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/pairs', {
                params: params,
                headers: { 'x-sideshift-secret': config.privateKey },
            });
            expect(result).toBeDefined();
        });

        it('should throw an error if coins array is empty', async () => {
            await expect(pairsAPI.getPairs([])).rejects.toThrow(
                'Coins cannot be empty. Please provide at least one coin.'
            );
        });
    });
});
