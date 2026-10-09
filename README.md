# Meteora DBC Agent MVP v5

A browser-first, non-custodial Meteora Dynamic Bonding Curve MVP for **Solana Devnet**.

## What is implemented

- Phantom wallet connect/disconnect.
- Devnet-only RPC endpoint.
- Meteora DBC SDK **1.5.13** integration.
- Curve construction with `buildCurveWithMarketCap`, including configurable starting/ending fees, fee-schedule periods/duration, creator trading-fee percentage, and partner/creator liquidity allocation.
- Input validation for market-cap ordering, fee bounds/decay schedule, a 100% liquidity-allocation total, and the DAMM v2 minimum 10% locked-liquidity rule.
- Real DBC config transaction via `client.partner.createConfig`.
- Real token + DBC pool transaction via `client.creator.createPool`.
- Phantom is the user signer; the application never asks for a seed phrase or private key.
- Devnet Explorer links for confirmed transactions and created accounts.
- Local validation test.

## Safety boundary

This MVP is deliberately **Devnet-only**. Do not use a mainnet wallet or mainnet funds for the first test.

The transaction path is:

1. Connect Phantom on Solana Devnet.
2. Build the DBC configuration locally.
3. Generate the required config signer in the browser.
4. Phantom signs the transaction.
5. The browser broadcasts the signed transaction to Solana Devnet.
6. The UI links the confirmed signature/account to Solana Explorer.

No automatic signing or custody is implemented.

## Run locally

```bash
npm install
npm test
npm run check
npm run build
npm run dev
```

Open the Vite URL shown by the terminal.

## First real test

1. Set Phantom to **Devnet**.
2. Use a test wallet with Devnet SOL.
3. Connect Phantom.
4. Click **Create DBC Config** and approve the Devnet transaction.
5. After confirmation, click **Create Token + DBC Pool** and approve.
6. Verify both signatures in Solana Explorer.

## Current limits

- No Mainnet execution path.
- No automatic wallet signing.
- No seed/private-key input.
- Metadata is a public static JSON file in this repository.
- Graduation/migration and swap UI are not yet wired into the browser surface.

## Upstream references

- Meteora DBC docs: https://docs.meteora.ag/developer-guides/dbc
- Meteora DBC SDK: https://github.com/MeteoraAg/dynamic-bonding-curve-sdk
- Solana Devnet Explorer: https://explorer.solana.com/?cluster=devnet
