import { SideShiftClient } from '../src';

async function main(): Promise<void> {
  const client = new SideShiftClient({
    apiKey: 'your-api-key',
    baseUrl: 'https://sideshift.ai',
    apiVersion: 'v2',
    maxRequestsPerMinute: 20,
  });

  try {
    
    // const coinResponse = await client.getPair('btc', 'eth', 0.1);
    // const coinResponse = await client.getPairs('btc-mainnet,usdc-bsc,bch,eth');
    const coinResponse = await client.getXAIStats();
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