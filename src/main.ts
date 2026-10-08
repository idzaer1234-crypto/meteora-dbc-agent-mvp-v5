import "./style.css";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import {
  ActivationType,
  BaseFeeMode,
  CollectFeeMode,
  DynamicBondingCurveClient,
  MigrationFeeOption,
  MigrationOption,
  TokenAuthorityOption,
  TokenDecimal,
  TokenType,
  buildCurveWithMarketCap
} from "@meteora-ag/dynamic-bonding-curve-sdk";

type PhantomProvider = {
  isPhantom?: boolean;
  publicKey?: PublicKey;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
};

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

const RPC_URL = "https://api.devnet.solana.com";
const EXPLORER = "https://explorer.solana.com";
const QUOTE_MINT = new PublicKey("So11111111111111111111111111111111111111112");
const METADATA_URI = "https://raw.githubusercontent.com/idzaer1234-crypto/meteora-dbc-agent-mvp-v5/main/public/metadata.json";

const connection = new Connection(RPC_URL, "confirmed");
const client = new DynamicBondingCurveClient(connection, "confirmed");

const app = document.querySelector<HTMLDivElement>("#app")!;

let wallet: PublicKey | null = null;
let lastConfig: PublicKey | null = null;
let lastMint: PublicKey | null = null;
let busy = false;

function short(value: string) {
  return value.length > 12 ? value.slice(0, 6) + "…" + value.slice(-6) : value;
}

function explorerAddress(address: PublicKey) {
  return `${EXPLORER}/address/${address.toBase58()}?cluster=devnet`;
}

function explorerTx(signature: string) {
  return `${EXPLORER}/tx/${signature}?cluster=devnet`;
}

function setStatus(message: string, error = false) {
  const node = document.querySelector<HTMLDivElement>("#status");
  if (!node) return;
  node.className = error ? "status error" : "status";
  node.textContent = message;
}

function render() {
  app.innerHTML = `
    <section class="shell">
      <header>
        <div>
          <p class="eyebrow">SOLANA · DEVNET</p>
          <h1>Meteora DBC Agent <span>MVP v5</span></h1>
          <p class="sub">Non-custodial launch tooling: Phantom signs; the app never receives a seed phrase or private key.</p>
        </div>
        <div class="network">DBC program<br><code>dbcij3L…SMaqN</code></div>
      </header>

      <section class="card">
        <div class="row between">
          <div>
            <h2>1. Wallet</h2>
            <p id="walletLabel">${wallet ? `Connected: ${short(wallet.toBase58())}` : "Not connected"}</p>
          </div>
          <button id="connect">${wallet ? "Disconnect" : "Connect Phantom"}</button>
        </div>
        <p class="hint">Devnet only. Switch Phantom to Solana Devnet before signing.</p>
      </section>

      <section class="card">
        <h2>2. DBC configuration</h2>
        <div class="grid">
          <label>Token name<input id="tokenName" value="Meteora Agent Test" maxlength="32"></label>
          <label>Symbol<input id="tokenSymbol" value="MAT" maxlength="10"></label>
          <label>Initial market cap (SOL)<input id="initialCap" type="number" min="0.001" step="0.001" value="0.1"></label>
          <label>Migration market cap (SOL)<input id="migrationCap" type="number" min="0.002" step="0.001" value="1"></label>
        </div>
        <div class="actions">
          <button id="createConfig" disabled>Create DBC Config</button>
          <button id="createPool" disabled>Create Token + DBC Pool</button>
        </div>
        <p class="hint">The two buttons create real Devnet transactions and require Phantom approval. No Mainnet transaction is enabled in this MVP.</p>
      </section>

      <section class="card">
        <h2>3. Verification</h2>
        <div id="result" class="result">No Devnet transaction yet.</div>
      </section>

      <div id="status" class="status">Ready.</div>

      <footer>
        <a href="https://docs.meteora.ag/developer-guides/dbc" target="_blank" rel="noreferrer">Meteora DBC docs</a>
        <span>·</span>
        <a href="https://github.com/idzaer1234-crypto/meteora-dbc-agent-mvp-v5" target="_blank" rel="noreferrer">GitHub</a>
      </footer>
    </section>
  `;

  document.querySelector<HTMLButtonElement>("#connect")!.onclick = async () => {
    if (busy) return;
    try {
      busy = true;
      if (wallet) {
        await window.solana?.disconnect();
        wallet = null;
        setStatus("Wallet disconnected.");
      } else {
        if (!window.solana?.isPhantom) throw new Error("Phantom was not detected. Install/open Phantom.");
        const result = await window.solana.connect();
        wallet = result.publicKey;
        setStatus(`Connected ${short(wallet.toBase58())} on Devnet.`);
      }
      render();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e), true);
    } finally {
      busy = false;
    }
  };

  document.querySelector<HTMLButtonElement>("#createConfig")!.onclick = createConfig;
  document.querySelector<HTMLButtonElement>("#createPool")!.onclick = createPool;
  updateButtons();
}

function updateButtons() {
  const enabled = Boolean(wallet) && !busy;
  const configButton = document.querySelector<HTMLButtonElement>("#createConfig");
  const poolButton = document.querySelector<HTMLButtonElement>("#createPool");
  if (configButton) configButton.disabled = !enabled;
  if (poolButton) poolButton.disabled = !enabled || !lastConfig;
}

async function prepareAndSign(tx: Transaction, extraSigner: Keypair) {
  if (!wallet || !window.solana) throw new Error("Connect Phantom first.");
  const latest = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = latest.blockhash;
  tx.feePayer = wallet;
  tx.partialSign(extraSigner);
  const signed = await window.solana.signTransaction(tx);
  return { signed, latest };
}

async function send(signed: Transaction, latest: { blockhash: string; lastValidBlockHeight: number }) {
  const signature = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: false });
  await connection.confirmTransaction(
    { signature, blockhash: latest.blockhash, lastValidBlockHeight: latest.lastValidBlockHeight },
    "confirmed"
  );
  return signature;
}

function readCurve() {
  const initial = Number((document.querySelector<HTMLInputElement>("#initialCap")!).value);
  const migration = Number((document.querySelector<HTMLInputElement>("#migrationCap")!).value);
  if (!Number.isFinite(initial) || !Number.isFinite(migration) || initial <= 0 || migration <= initial) {
    throw new Error("Migration market cap must be greater than initial market cap.");
  }

  return buildCurveWithMarketCap({
    token: {
      tokenType: TokenType.SPLToken,
      tokenBaseDecimal: TokenDecimal.SIX,
      tokenQuoteDecimal: TokenDecimal.NINE,
      tokenAuthorityOption: TokenAuthorityOption.Immutable,
      totalTokenSupply: 1_000_000_000,
      leftover: 0
    },
    fee: {
      baseFeeParams: {
        baseFeeMode: BaseFeeMode.FeeSchedulerLinear,
        feeSchedulerParam: {
          startingFeeBps: 100,
          endingFeeBps: 100,
          numberOfPeriod: 0,
          totalDuration: 0
        }
      },
      dynamicFeeEnabled: true,
      collectFeeMode: CollectFeeMode.QuoteToken,
      creatorTradingFeePercentage: 50,
      poolCreationFee: 0,
      enableFirstSwapWithMinFee: false
    },
    migration: {
      migrationOption: MigrationOption.MET_DAMM_V2,
      migrationFeeOption: MigrationFeeOption.FixedBps200,
      migrationFee: { feePercentage: 0, creatorFeePercentage: 0 }
    },
    liquidityDistribution: {
      partnerLiquidityPercentage: 50,
      partnerPermanentLockedLiquidityPercentage: 5,
      creatorLiquidityPercentage: 40,
      creatorPermanentLockedLiquidityPercentage: 5
    },
    lockedVesting: {
      totalLockedVestingAmount: 0,
      numberOfVestingPeriod: 0,
      cliffUnlockAmount: 0,
      totalVestingDuration: 0,
      cliffDurationFromMigrationTime: 0
    },
    activationType: ActivationType.Timestamp,
    initialMarketCap: initial,
    migrationMarketCap: migration
  });
}

async function createConfig() {
  if (!wallet) return;
  try {
    busy = true; updateButtons();
    setStatus("Building DBC config transaction…");
    const curve = readCurve();
    const config = Keypair.generate();

    const tx = await client.partner.createConfig({
      config: config.publicKey,
      feeClaimer: wallet,
      leftoverReceiver: wallet,
      payer: wallet,
      quoteMint: QUOTE_MINT,
      ...curve
    });

    const prepared = await prepareAndSign(tx, config);
    setStatus("Phantom signed. Broadcasting Devnet transaction…");
    const signature = await send(prepared.signed, prepared.latest);
    lastConfig = config.publicKey;
    const onChainConfig = await client.state.getPoolConfig(lastConfig);
    if (!onChainConfig) throw new Error("Transaction confirmed, but the DBC config account was not readable yet.");

    showResult(`Config created and verified: ${short(lastConfig.toBase58())}`, signature, lastConfig);
    setStatus("DBC config confirmed and readable on Solana Devnet.");
    updateButtons();
  } catch (e) {
    setStatus(e instanceof Error ? e.message : String(e), true);
  } finally {
    busy = false; updateButtons();
  }
}

async function createPool() {
  if (!wallet || !lastConfig) return;
  try {
    busy = true; updateButtons();
    const name = (document.querySelector<HTMLInputElement>("#tokenName")!).value.trim();
    const symbol = (document.querySelector<HTMLInputElement>("#tokenSymbol")!).value.trim();
    if (!name || !symbol) throw new Error("Token name and symbol are required.");

    setStatus("Building token + DBC pool transaction…");
    const baseMint = Keypair.generate();

    const tx = await client.creator.createPool({
      name,
      symbol,
      uri: METADATA_URI,
      payer: wallet,
      poolCreator: wallet,
      config: lastConfig,
      baseMint: baseMint.publicKey
    });

    const prepared = await prepareAndSign(tx, baseMint);
    setStatus("Phantom signed. Broadcasting Devnet pool transaction…");
    const signature = await send(prepared.signed, prepared.latest);
    lastMint = baseMint.publicKey;
    const onChainPool = await client.state.getPoolByBaseMint(lastMint);
    if (!onChainPool) throw new Error("Transaction confirmed, but the DBC pool was not readable yet.");

    showResult(`Pool/token created and verified: ${short(lastMint.toBase58())}`, signature, lastMint);
    setStatus("DBC pool confirmed and readable on Solana Devnet.");
    updateButtons();
  } catch (e) {
    setStatus(e instanceof Error ? e.message : String(e), true);
  } finally {
    busy = false; updateButtons();
  }
}

function showResult(label: string, signature: string, address: PublicKey) {
  const node = document.querySelector<HTMLDivElement>("#result");
  if (!node) return;
  node.innerHTML = `
    <strong>${label}</strong>
    <div>Transaction: <a href="${explorerTx(signature)}" target="_blank" rel="noreferrer"><code>${short(signature)}</code></a></div>
    <div>Address: <a href="${explorerAddress(address)}" target="_blank" rel="noreferrer"><code>${short(address.toBase58())}</code></a></div>
  `;
}

render();
