export interface Coin {
    coin: string;
    name: string;
    networks: string[];
    hasMemo: boolean;
    fixedOnly: string[] | boolean;
    variableOnly: string[] | boolean;
    tokenDetails: {
        network: {
            contractAddress: string;
            decimals: number;
        };
    };
    networksWithMemo?: string[];
    depositOffline?: string[] | boolean;
    settleOffline?: string[] | boolean;
}
