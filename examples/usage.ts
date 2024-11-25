import { SideShiftClient } from '../src';

async function main(): Promise<void> {
    const client = new SideShiftClient('your-account-id', 'your-api-privatekey');

    try {
        const coinResponse = await client.getCoins();
        if (coinResponse.error) {
            console.error('Error fetching coins:', coinResponse);
            return;
        }
        console.log('Response: ', coinResponse);
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

main().catch(console.error);
