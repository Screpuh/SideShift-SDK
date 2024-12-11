import { SideShiftClient } from '../src';

async function main(): Promise<void> {
    // Learn how to create an accountId/affiliateId and private-key: https://help.sideshift.ai/en/articles/8974541-how-to-create-a-sideshift-ai-account-and-backup-your-private-key
    const client = new SideShiftClient('your-api-privatekey');

    try {
        // use 'npx ts-node examples/usage.ts' to run this example from the command line
        const coinResponse = await client.getCoins();
        if (coinResponse.error) {
            console.error('Error fetching coins:', coinResponse);
            return;
        }
        console.log('Response: ', coinResponse);

        const body = {
            settleCoin: 'XRP',
            settleNetwork: 'ripple',
            settleAddress: 'rsTAYkk7VQfBdD5btt2WzXYphER6F2BTuN',
            settleMemo: '109',
            settleAmount: '25',
            affiliateId: 'your-affiliate-id',
            successUrl: 'https://example.com/success',
            cancelUrl: 'https://example.com/cancel',
        };
        const ip = 'your-ip-address';
        const checkoutResponse = await client.postCreateCheckout(body, ip);

        console.log('Checkout response:', checkoutResponse);
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

main().catch(console.error);
