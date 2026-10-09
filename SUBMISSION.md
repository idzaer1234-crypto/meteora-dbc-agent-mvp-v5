# Submission Pack — Meteora DBC Agent MVP v5

## Project links

- App: https://meteora-dbc-agent-mvp-v5.vercel.app
- Source repository: https://github.com/idzaer1234-crypto/meteora-dbc-agent-mvp-v5
- Meteora DBC documentation: https://docs.meteora.ag/developer-guides/dbc
- Solana Devnet Explorer: https://explorer.solana.com/?cluster=devnet

## Short project description

Meteora DBC Agent MVP v5 is a browser-based, non-custodial prototype for preparing and submitting Meteora Dynamic Bonding Curve configuration and token/pool creation transactions on Solana Devnet. The user connects Phantom and approves each transaction. The app does not request seed phrases or private keys.

## Suggested Superteam Earn form fields

- **Target listing:** https://superteam.fun/earn/listing/meteora-dbc/
- **Project title:** Meteora DBC Launch Configurator — Devnet MVP
- **Primary submission URL:** https://meteora-dbc-agent-mvp-v5.vercel.app
- **Source code URL:** https://github.com/idzaer1234-crypto/meteora-dbc-agent-mvp-v5
- **Short description:** A non-custodial browser MVP for configuring Meteora DBC launch parameters and creating a DBC config plus token/pool on Solana Devnet through explicit Phantom approval.
- **Long description:** This prototype lets a user connect Phantom, configure initial and migration market caps, starting and ending fees, creator trading-fee percentage, and partner/creator liquidity allocation. It validates the liquidity split, requests Phantom signatures for the DBC config and token/pool transactions, confirms transactions against Solana Devnet, reads created accounts back, and provides Devnet Explorer links. It is deliberately non-custodial and has no Mainnet execution path. It remains an MVP: live end-to-end wallet transactions have not been independently verified in this work session, and graduation/migration and swap UI are not wired.
- **Submission status:** Do not submit until the latest deployment is READY and the live app is opened successfully in a normal browser session. If the bounty requires a working end-to-end on-chain demonstration, test with a disposable Devnet wallet and retain Explorer links before claiming that criterion is met.

## Copy-ready submission post

Built **Meteora DBC Agent MVP v5** — a browser-first, non-custodial prototype for Meteora Dynamic Bonding Curve launches on Solana Devnet.

Current scope:
- Phantom wallet connect/disconnect
- Devnet RPC and Devnet Explorer links
- Configurable DBC curve parameters: initial/migration market caps, starting/ending fees, creator trading-fee percentage, and partner/creator liquidity splits
- Token + DBC pool creation flow
- On-chain account read-back checks after confirmation
- No seed phrase/private-key collection and no Mainnet transaction path

App: https://meteora-dbc-agent-mvp-v5.vercel.app
Code: https://github.com/idzaer1234-crypto/meteora-dbc-agent-mvp-v5

This is an MVP, not a production launch platform. Graduation/migration and swap UI are not wired yet. I am distinguishing automated build checks from a full end-to-end on-chain test; please review the source and current test evidence before treating it as production-ready.

## Current functionality described by the source

1. Connect or disconnect Phantom.
2. Build a DBC curve from the entered initial and migration market-cap values, starting/ending fee basis points, creator fee percentage, and partner/creator liquidity allocation.
3. Request Phantom approval for a DBC config transaction.
4. Submit the signed transaction to Solana Devnet and check that the config account can be read.
5. Request Phantom approval for token + DBC pool creation.
6. Submit the signed transaction to Solana Devnet and check that the pool can be read.
7. Display Devnet Explorer links for the confirmed transaction and created address.

## Verification checklist before submission

- [ ] Run `npm install` successfully from a clean checkout.
- [ ] Run `npm test` and retain the actual output.
- [ ] Run `npm run check` and retain the actual output.
- [ ] Run `npm run build` and retain the actual output.
- [ ] Open the deployed app in a normal browser session and confirm it is not blocked by deployment protection.
- [ ] Confirm Phantom is detected and wallet connect/disconnect works.
- [ ] With a disposable Devnet wallet funded only with test SOL, test the config transaction and verify its signature/account in Devnet Explorer.
- [ ] Test token + pool creation only after the config flow passes; verify its signature and pool in Devnet Explorer.
- [ ] Check that token name/symbol and the metadata URI remain consistent.
- [ ] Record any failed or untested step; do not claim end-to-end success without evidence.

## Known scope limits

- Devnet-only prototype; do not use Mainnet funds.
- No automatic signing or custody.
- No seed phrase/private-key input.
- Metadata points to a static JSON file in the repository. The app now rejects a token name or symbol that differs from the static metadata values (Meteora Agent Test / MAT).
- Graduation/migration and swap UI are not wired.
- Source-level validation checks integration markers, configurable-parameter safeguards, and required files; it does not itself prove that transactions succeed on-chain.

## Submission integrity

Only mark the project as ready to submit after the checklist has been completed to the level required by the specific bounty. If no live Devnet transaction was tested, explicitly say so. Never imply that a CI success proves end-to-end wallet or on-chain behavior.
