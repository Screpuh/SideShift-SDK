import { SideShiftHttpHandler } from '../../../api/sideShiftHttpClient';
import { SideShiftConfig } from '../../../types';
import axios from 'axios';
import { CheckoutAPI } from '../../../api/public';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CheckoutAPI', () => {
    let client: SideShiftHttpHandler;
    let checkoutAPI: CheckoutAPI;
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
        checkoutAPI = new CheckoutAPI(client);
    });

    describe('Checkout API Integration', () => {
        it('should call /checkout with correct config', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: {} });

            const checkoutId = 'test-checkout-id';
            const result = await checkoutAPI.getCheckout(checkoutId);
            expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/checkout/${checkoutId}`, {
                headers: {},
                params: undefined,
            });

            expect(result).toBeDefined();
        });
    });
});
