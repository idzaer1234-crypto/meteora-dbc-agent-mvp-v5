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
  "creatorTradingFeePercentage: creatorFeePct",
  "partnerLiquidityPercentage: partnerLiquidityPct",
  "confirmation.value.err",
  "This MVP uses static metadata",
  "partnerLiquidityPct + partnerLockedPct + creatorLiquidityPct + creatorLockedPct !== 100",
  'id="startingFeeBps"',
  'id="endingFeeBps"'
]) {
  assert.ok(source.includes(marker), `missing integration marker: ${marker}`);
}

assert.ok(source.includes("Devnet"));
assert.ok(source.includes("signTransaction"));
assert.ok(source.includes("busy = false;\n      updateButtons();"), "wallet buttons must be re-enabled after connect/disconnect");
console.log("MVP v5 validation: PASS");
console.log(`Checked ${required.length} required files and core Devnet/Phantom markers.`);
