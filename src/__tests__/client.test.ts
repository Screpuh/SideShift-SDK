import axios from 'axios';
import { SideShiftConfig } from '../types';
import { SideShiftHttpHandler } from '../api/sideShiftHttpClient';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SideShiftHttpHandler', () => {
    let client: SideShiftHttpHandler;
    let config: SideShiftConfig;

    beforeEach(() => {
        config = {
            baseUrl: 'https://api.example.com',
            privateKey: 'test-key',
            affiliateId: 'test-affiliate',
            maxRequest: {
                shift: 10,
                quote: 5,
                default: 30,
            },
            verbose: false,
        };

        const mockAxiosInstance = {
            get: jest.fn(),
            post: jest.fn(),
        };
        mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

        client = new SideShiftHttpHandler(config);
    });

    describe('execute method', () => {
        it('should make GET request with correct parameters', async () => {
            const mockResponse = {
                data: [{ symbol: 'BTC', name: 'Bitcoin' }],
                status: 200,
            };

            const mockAxiosInstance = mockedAxios.create();
            (mockAxiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);

            const result = await client.execute('GET', '/coins', { test: 'param' });

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/coins', {
                headers: {},
                params: { test: 'param' },
            });
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockResponse.data);
        });

        it('should make POST request with data in body', async () => {
            const mockResponse = {
                data: { id: '123', status: 'created' },
                status: 201,
            };

            const mockAxiosInstance = mockedAxios.create();
            (mockAxiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);

            const postData = { amount: 100, from: 'BTC', to: 'ETH' };
            const result = await client.execute(
                'POST',
                '/shifts/fixed',
                { param: 'value' },
                {
                    data: postData,
                }
            );

            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/shifts/fixed', postData, {
                headers: {},
                params: { param: 'value' },
            });
            expect(result.success).toBe(true);
        });

        it('should handle authentication headers', async () => {
            const mockAxiosInstance = mockedAxios.create();
            (mockAxiosInstance.get as jest.Mock).mockResolvedValue({ data: {}, status: 200 });

            await client.execute(
                'GET',
                '/account',
                {},
                {
                    auth: true,
                    userIp: '192.168.1.1',
                }
            );

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/account', {
                headers: {
                    'x-sideshift-secret': 'test-key',
                    'x-user-ip': '192.168.1.1',
                },
                params: {},
            });
        });

        it('should include affiliate ID in parameters', async () => {
            const mockAxiosInstance = mockedAxios.create();
            (mockAxiosInstance.get as jest.Mock).mockResolvedValue({ data: {}, status: 200 });

            const result = await client.execute('GET', '/coins', { affiliateId: 'test-affiliate' });

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/coins', {
                headers: {},
                params: { affiliateId: 'test-affiliate' },
            });
            expect(result.success).toBe(true);
        });

        it('should include affiliate ID in body for post', async () => {
            const mockAxiosInstance = mockedAxios.create();
            (mockAxiosInstance.post as jest.Mock).mockResolvedValue({ data: {}, status: 200 });

            const postData = { amount: 100, from: 'BTC', to: 'ETH' };
            const result = await client.execute(
                'POST',
                '/shifts/fixed',
                { affiliateId: 'test-affiliate' },
                {
                    data: postData,
                }
            );

            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/shifts/fixed',
                {
                    ...postData,
                    affiliateId: 'test-affiliate',
                },
                {
                    headers: {},
                    params: {},
                }
            );
            expect(result.success).toBe(true);
        });

        it('should handle network errors', async () => {
            const mockAxiosInstance = mockedAxios.create();
            const networkError = new Error('Network Error');
            (mockAxiosInstance.get as jest.Mock).mockRejectedValue(networkError);

            const result = await client.execute('GET', '/coins');

            expect(result.success).toBe(false);
            expect(result.error).toContain('Network Error');
        });

        it('should handle HTTP error responses', async () => {
            const mockAxiosInstance = mockedAxios.create();
            const axiosError = {
                isAxiosError: true,
                response: {
                    status: 404,
                    statusText: 'Not Found',
                    data: { error: 'Endpoint not found' },
                },
            };

            (mockedAxios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
            (mockAxiosInstance.get as jest.Mock).mockRejectedValue(axiosError);

            const result = await client.execute('GET', '/invalid-endpoint');

            expect(result.success).toBe(false);
            expect(result.status).toBe(404);
            expect(result.error).toContain('404 Not Found');
        });
    });

    describe('rate limiting', () => {
        it('should enforce rate limits', async () => {
            const mockAxiosInstance = mockedAxios.create();
            (mockAxiosInstance.get as jest.Mock).mockResolvedValue({ data: {}, status: 200 });

            for (let i = 0; i < 10; i++) {
                await client.execute('GET', '/coins', {}, { category: 'shift' });
            }

            // The 11th request should throw
            const result = await client.execute('GET', '/coins', {}, { category: 'shift' });
            expect(result.success).toBe(false);
            expect(result.error).toContain('Rate limit exceeded');
        });

        it('should reset rate limit after time window', async () => {
            const mockAxiosInstance = mockedAxios.create();
            (mockAxiosInstance.get as jest.Mock).mockResolvedValue({ data: {}, status: 200 });

            for (let i = 0; i < 10; i++) {
                await client.execute('GET', '/coins', {}, { category: 'shift' });
            }

            jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 61000);

            const result = await client.execute('GET', '/coins', {}, { category: 'shift' });
            expect(result.success).toBe(true);
        });
    });

    describe('verbose logging', () => {
        it('should log requests when verbose is true', async () => {
            const verboseConfig = { ...config, verbose: true };
            const verboseClient = new SideShiftHttpHandler(verboseConfig);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const mockAxiosInstance = mockedAxios.create();
            (mockAxiosInstance.get as jest.Mock).mockResolvedValue({ data: {}, status: 200 });

            await verboseClient.execute('GET', '/coins');

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('=== [Debug] HTTP Response ===')
            );

            consoleSpy.mockRestore();
        });
    });
});
