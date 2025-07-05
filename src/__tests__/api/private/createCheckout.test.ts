import { CreateCheckoutAPI } from '../../../api/private/checkout';
import { SideShiftHttpHandler } from '../../../api/sideShiftHttpClient';
import { SideShiftConfig } from '../../../types';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CreateCheckout', () => {
    let client: SideShiftHttpHandler;
    let createCheckoutAPI: CreateCheckoutAPI;
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
                shift: 5,
                quote: 20,
                default: 30,
            },
            verbose: false,
        };

        client = new SideShiftHttpHandler(config);
        createCheckoutAPI = new CreateCheckoutAPI(client);
    });

    describe('postCreateCheckout', () => {
        it('should call /checkout with correct parameters', async () => {
            const mockResponse = { data: { id: 'checkout-id', status: 'created' } };
            mockAxiosInstance.post.mockResolvedValue(mockResponse);

            const body = {
                settleCoin: 'btc',
                settleNetwork: 'mainnet',
                settleAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                settleAmount: '0.01',
                successUrl: 'https://example.com/success',
                cancelUrl: 'https://example.com/cancel',
            };

            const result = await createCheckoutAPI.postCreateCheckout(body);

            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/checkout',
                { ...body, affiliateId: config.affiliateId },
                {
                    headers: {
                        'x-sideshift-secret': config.privateKey,
                    },
                    params: {},
                }
            );
            expect(result).toBeDefined();
        });
    });
});
