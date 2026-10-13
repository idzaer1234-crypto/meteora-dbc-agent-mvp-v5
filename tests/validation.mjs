import fs from "node:fs";
import assert from "node:assert/strict";

const required = [
  "package.json",
  "index.html",
  "src/main.ts",
  "src/style.css",
  "public/metadata.json",
  "tsconfig.json",
  "vite.config.ts"
];

for (const file of required) {
  assert.equal(fs.existsSync(file), true, `missing ${file}`);
}

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
assert.equal(pkg.dependencies["@meteora-ag/dynamic-bonding-curve-sdk"], "1.5.13");
assert.equal(pkg.dependencies["@solana/web3.js"], "1.98.4");

const source = fs.readFileSync("src/main.ts", "utf8");
for (const marker of [
  "DynamicBondingCurveClient",
  "buildCurveWithMarketCap",
  "client.partner.createConfig",
  "client.creator.createPool",
  "signTransaction",
  "sendRawTransaction",
  "cluster=devnet",
  "startingFeeBps",
  "endingFeeBps",
  "feePeriods",
  "feeDuration",
  "v >= 25 && v <= 9900",
  "endingFeeBps > startingFeeBps",
  "partnerLockedPct + creatorLockedPct < 10",
  "startingFeeBps !== endingFeeBps && (feePeriods < 1 || feeDuration < 1)",
  "creatorTradingFeePercentage: creatorFeePct",
  "partnerLiquidityPercentage: partnerLiquidityPct",
  "confirmation.value.err",
  "This MVP uses static metadata",
  "partnerLiquidityPct + partnerLockedPct + creatorLiquidityPct + creatorLockedPct !== 100",
  'id="startingFeeBps"',
  'id="endingFeeBps"',
  'id="feePeriods"',
  'id="feeDuration"'
]) {
  assert.ok(source.includes(marker), `missing integration marker: ${marker}`);
}

assert.ok(source.includes("Devnet"));
assert.ok(source.includes("signTransaction"));
assert.ok(source.includes("busy = false;\n      updateButtons();"), "wallet buttons must be re-enabled after connect/disconnect");
const rpcMatch = source.match(/const RPC_URL = ["']([^"']+)["']/);
assert.ok(rpcMatch, "RPC_URL must be explicitly declared");
assert.equal(rpcMatch[1], "https://api.devnet.solana.com", "all app RPC traffic must remain on Solana Devnet");
assert.ok(source.includes('new Connection(RPC_URL, "confirmed")'), "Solana Connection must use the guarded Devnet RPC");
assert.ok(source.includes('const EXPLORER = "https://explorer.solana.com"'), "Explorer base URL must be the official Solana Explorer");
assert.ok(source.includes("?cluster=devnet"), "Explorer links must explicitly select Devnet");
assert.equal(source.includes("https://api.mainnet-beta.solana.com"), false, "Mainnet RPC endpoints must not be present");
assert.equal(source.includes("https://api.mainnet.solana.com"), false, "Mainnet RPC endpoints must not be present");
assert.doesNotMatch(source, /<input[^>]+(?:seed.?phrase|mnemonic|private.?key)/i, "UI must not request seed phrases, mnemonics, or private keys");
assert.doesNotMatch(source, /id=["'](?:seedPhrase|mnemonic|privateKey)["']/i, "UI must not define credential input fields");
console.log("Devnet safety regression checks: PASS");

console.log("MVP v5 validation: PASS");
console.log(`Checked ${required.length} required files, core integration markers, and Devnet safety guardrails.`);
