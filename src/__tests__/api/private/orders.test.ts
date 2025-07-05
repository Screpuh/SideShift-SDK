import { OrdersAPI } from '../../../api/private';
import { SideShiftHttpHandler } from '../../../api/sideShiftHttpClient';
import { FixedShiftBody, QuoteBody, VariableShiftBody } from '../../../types/orders';
import { SideShiftConfig } from '../../../types';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OrdersAPI', () => {
    let client: SideShiftHttpHandler;
    let ordersAPI: OrdersAPI;
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
        ordersAPI = new OrdersAPI(client);
    });

    describe('Quote API Integration', () => {
        it('should call /quotes', async () => {
            const mockResponse = { data: {} };
            mockAxiosInstance.post.mockResolvedValue(mockResponse);

            const body: QuoteBody = {
                depositCoin: 'btc',
                settleCoin: 'eth',
                depositAmount: '0.01',
                settleAmount: null,
            };

            const result = await ordersAPI.postRequestQuote(body);

            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/quotes',
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

        it('should call /quotes with userIp', async () => {
            const userIp = '123.456.789.012';
            const mockResponse = { data: {} };
            mockAxiosInstance.post.mockResolvedValue(mockResponse);
            const body: QuoteBody = {
                depositCoin: 'btc',
                settleCoin: 'eth',
                depositAmount: '0.01',
                settleAmount: null,
            };
            const result = await ordersAPI.postRequestQuote(body, userIp);
            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/quotes',
                { ...body, affiliateId: config.affiliateId },
                {
                    headers: {
                        'x-sideshift-secret': config.privateKey,
                        'x-user-ip': userIp,
                    },
                    params: {},
                }
            );
            expect(result).toBeDefined();
        });

        it("depoistAmount and settleAmount can't both be null", async () => {
            const body: QuoteBody = {
                depositCoin: 'btc',
                settleCoin: 'eth',
                depositAmount: null,
                settleAmount: null,
            };
            mockAxiosInstance.post.mockRejectedValue({});

            await expect(ordersAPI.postRequestQuote(body)).rejects.toThrow(
                'At least one of depositAmount or settleAmount must be provided.'
            );
        });
    });

    describe('postFixedRateShift Integration', () => {
        it('should call /shifts/fixed with correct parameters', async () => {
            const mockResponse = { data: {} };
            mockAxiosInstance.post.mockResolvedValue(mockResponse);

            const body: FixedShiftBody = {
                settleAddress: 'test-settle-address',
                settleMemo: 'test-settle-memo',
                quoteId: 'test-quote-id',
                refundAddress: 'test-refund-address',
                refundMemo: 'test-refund-memo',
            };

            const result = await ordersAPI.postFixedRateShift(body);

            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/shifts/fixed',
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

    describe('postVariableRateShift Integration', () => {
        it('should call /shifts/variable with correct parameters', async () => {
            const mockResponse = { data: {} };
            mockAxiosInstance.post.mockResolvedValue(mockResponse);

            const body: VariableShiftBody = {
                settleAddress: 'test-settle-address',
                settleMemo: 'test-settle-memo',
                refundAddress: 'test-refund-address',
                refundMemo: 'test-refund-memo',
                depositCoin: 'btc',
                settleCoin: 'eth',
            };

            const result = await ordersAPI.postVariableRateShift(body);

            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/shifts/variable',
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

    describe('setRefundAddress Integration', () => {
        it('should call /shifts/:id/set-refund-address with correct parameters', async () => {
            const shiftId = 'test-shift-id';
            const refundAddress = 'test-refund-address';
            const refundMemo = 'test-refund-memo';
            const mockResponse = { data: {} };
            mockAxiosInstance.post.mockResolvedValue(mockResponse);

            const result = await ordersAPI.postSetRefundAddress(shiftId, refundAddress, refundMemo);

            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                `/shifts/${shiftId}/set-refund-address`,
                { refundAddress, refundMemo },
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

    describe('postCancelOrder Integration', () => {
        it('should call /cancel-order with correct parameters', async () => {
            const orderId = 'test-order-id';
            const mockResponse = { data: {} };
            mockAxiosInstance.post.mockResolvedValue(mockResponse);

            const result = await ordersAPI.postCancelOrder(orderId);

            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/cancel-order',
                { orderId },
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
