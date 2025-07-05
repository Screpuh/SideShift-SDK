import { AccountAPI } from '../../../api/private';
import { SideShiftHttpHandler } from '../../../api/sideShiftHttpClient';
import { SideShiftConfig } from '../../../types';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AccountAPI', () => {
    let client: SideShiftHttpHandler;
    let accountAPI: AccountAPI;
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
        accountAPI = new AccountAPI(client);
    });

    describe('Stats API Integration', () => {
        it('should call /account', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: {} });

            const result = await accountAPI.getAccount();

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/account', {
                headers: {
                    'x-sideshift-secret': config.privateKey,
                },
                params: {},
            });

            expect(result).toBeDefined();
        });
    });
});
