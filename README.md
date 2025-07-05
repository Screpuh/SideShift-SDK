# SideShift.ai API Client

A TypeScript client library for the SideShift.ai API.

## Installation

```bash
npm sideshift-node-sdk
```

## Quick Start

### 1. Setup Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then, update `.env` with your credentials:

- `PRIVATE_KEY`: Your `x-sideshift-secret`
- `AFFILIATE_ID`: Your `accountId` (used as the `affiliateId`)

#### How to get your credentials:

1. Visit [sideshift.ai](https://sideshift.ai)
2. Create a shift on the site **or** visit the [Account page](https://sideshift.ai/account) — this will automatically create an account
3. Copy your:

   - **Private Key** (`x-sideshift-secret`)
   - **Account ID** (`affiliateId`)

---

### 2. Initialize the Client

```typescript
import { SideShiftClient } from "../SideShiftClient";
import { loadSideShiftConfig } from "../utils/loadSideShiftConfig";

const config = loadSideShiftConfig();
const sideShiftClient = new SideShiftClient(config);
```

---

Here are some examples of HTTP API calls:

```typescript
// Get coins
const coins = await sideShiftClient.coins.getCoins();
console.log(coins.data);

// Create a fixed shift
const body = {
  settleAddress: "settle-address",
  settleMemo: "settle-memo",
  quoteId: "quote-id",
  refundAddress: "refund-address",
};
const fixedShift = await sideShiftClient.order.postFixedRateShift(body);
console.log(fixedShift.data);

// Get account information
const account = await sideShiftClient.account.getAccount();
console.log(account.data);
```

All HTTP requests, responses, and parameters are defined as types within the library, enabling strict type checking.
Type definitions strictly follow the official API specification.

```typescript
// Example with type annotations
const quoteBody: QuoteBody = {
  depositCoin: "BTC",
  settleCoin: "ETH",
  depositAmount: "0.01",
  settleAmount: null,
};

const response: ApiResponse<Quote> = await sideShiftAPI.orders.postRequestQuote(quoteBody);
```

## HTTP API Response Format

All HTTP API responses follow the `ApiResponse` interface:

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
  status?: number;
}
```

### Success Response Example

```typescript
{
  success: true,
  data: {
    id: 'account-id',
    lifetimeStakingRewards: '0',
    unstaking: '0',
    staked: '0',
    available: '0',
    totalBalance: '0'
  },
  status: 200
}

```

### Error Response Example

See https://docs.sideshift.ai/troubleshoot-errors for an overview of all errors.

```typescript
{
  success: false,
  data: null,
  error: 'GET /account failed: 401 Unauthorized - Account required. Add x-sideshift-secret header',
  status: 401
}
```

### 3. Authentication

All authentication processes are handled inside the SideShiftHttpClient when using private endpoints. You only need to provide your Private Key and Account Id in your .env file.

### 4. Permissions

SideShift.ai restricts access from certain countries. To comply, use the /v2/permissions endpoint with the user's IP address to check if usage is allowed. If the userIp is omitted, the IP address of the request origin will be used instead.

The following endpoints require the user's IP via the x-user-ip header:

- GET /permissions
- POST /quotes
- POST /shifts/fixed
- POST /shifts/variable
- POST /checkouts

```typescript
// Create a fixed shift with user ip
const userIp = 1.23.45.678
const body = {
  settleAddress: "settle-address",
  settleMemo: "settle-memo",
  quoteId: "quote-id",
  refundAddress: "refund-address",
};
const fixedShift = await sideShiftClient.order.postFixedRateShift(body, userIP);
console.log(fixedShift.data);

```

## Features

- **TypeScript Support**: Complete type definitions for all API requests and responses
- **REST API Client**: Access to all SideShift.ai endpoints (public and private)
- **Authentication**: Secure API key and secret handling
- **Error Handling**: Comprehensive error handling with detailed error messages

## API Documentation

### HTTP API

The client provides access to all SideShift.ai REST API endpoints.

1. Public endpoints

- coins
- coin icon
- permissions
- shift
- bulk shifts
- recent shifts
- xai stats
- checkout

2. Private endpoints

- account
- pair
- pairs
- request quote
- create fixed shift
- create variable shift
- set refund address
- cancel order
- create checkout
