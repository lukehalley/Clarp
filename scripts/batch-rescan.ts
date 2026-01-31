#!/usr/bin/env npx tsx
/**
 * Batch Rescan Script
 *
 * Rescans all projects that are missing source_attribution and perplexity_citations
 * (i.e., projects scanned before the Perplexity + cross-reference pipeline was added).
 *
 * Usage:
 *   npx tsx scripts/batch-rescan.ts [--dry-run] [--delay=90] [--base-url=https://clarp.xyz]
 *
 * Options:
 *   --dry-run      Print what would be rescanned without doing it
 *   --delay=N      Seconds between scans (default: 90)
 *   --base-url=URL Override the target URL (default: https://clarp.xyz)
 *   --start=N      Start from Nth project (0-indexed, for resuming)
 *   --limit=N      Only rescan N projects
 */

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const delayArg = args.find((a) => a.startsWith('--delay='));
const baseUrlArg = args.find((a) => a.startsWith('--base-url='));
const startArg = args.find((a) => a.startsWith('--start='));
const limitArg = args.find((a) => a.startsWith('--limit='));

const DELAY_SECONDS = delayArg ? parseInt(delayArg.split('=')[1]) : 90;
const BASE_URL = baseUrlArg ? baseUrlArg.split('=')[1] : 'https://clarp.xyz';
const START_INDEX = startArg ? parseInt(startArg.split('=')[1]) : 0;
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

// Projects needing rescan: have x_handle but missing source_attribution + perplexity_citations
// Excludes ZERA (already rescanned) and junk handles like "i", "using"
const PROJECTS_TO_RESCAN = [
  // Priority 1: Projects with entity_type set + medium confidence (got Grok analysis but no Perplexity)
  { handle: 'kamiyoai', name: 'KAMIYO' },
  { handle: 'primisprotocol', name: 'Primis Protocol' },
  { handle: 'c4__studios', name: 'Connect 4' },
  { handle: 'pumpfun', name: 'Pump' },
  { handle: 'circuitx_app', name: 'CircuitX' },
  { handle: 'crossfundxyz', name: 'CrossFund' },
  { handle: 'ghostwareos', name: 'GhostwareOS' },
  { handle: 'readia_io', name: 'Readia.io' },
  { handle: 'ordodotsh', name: 'ordo.sh' },
  { handle: 'rainmakerdotfun', name: 'Rainmaker' },
  { handle: 'thepippinco', name: 'Pippin' },
  { handle: 'trololol_io', name: 'TROLL' },
  { handle: 'agentzigma', name: 'Zigma' },
  { handle: 'bagsfm', name: 'BagsWorld' },
  { handle: 'moonbirds', name: 'Moonbirds' },
  { handle: 'copperinucto', name: 'copper inu' },
  { handle: 'suzupay_fi', name: 'SuzuPay' },
  { handle: 'perkinsfund', name: 'PCEF' },
  { handle: 'corvusdotwtf', name: 'Corvus' },
  { handle: 'storedotfun', name: 'Store.fun' },
  { handle: 'payainetwork', name: 'PayAI Network' },
  { handle: 'startdotfun', name: 'Start Fun' },

  // Priority 2: Projects with entity_type + interesting content
  { handle: 'pyrodotbuzz', name: 'Pyro' },
  { handle: 'sidex_fun', name: 'SideX' },
  { handle: 'avocadoai_co', name: 'Avocado AI' },
  { handle: 'ciphernetsolana', name: 'CipherNet' },
  { handle: 'solguardvpn', name: 'Guard VPN' },
  { handle: 'disclaimercoin', name: 'DisclaimerCoin' },
  { handle: 'metalminerx', name: 'MetalMiner' },
  { handle: 'cruciblefinance', name: 'Crucible' },
  { handle: 'fartcoinofsol', name: 'Fartcoin' },
  { handle: 'chronoeffe', name: 'Chronoeffector' },
  { handle: 'whitewhalememe', name: 'The White Whale' },
  { handle: 'foreveraloneio', name: 'forever alone' },
  { handle: 'startuponsol', name: 'Startup' },
  { handle: 'theclippymeme', name: 'Clippy' },
  { handle: 'fantasyindexpf', name: 'Fantasy Index' },
  { handle: 'solboy2026', name: 'SOLBOY' },
  { handle: 'egg637987986486', name: 'THE EGG' },
  { handle: 'rageguy_lol', name: 'Rage Guy' },
  { handle: 'testicletoken', name: 'testicle' },
  { handle: 'tiktokdogjohnny', name: 'Johnny' },

  // Priority 3: Person entities
  { handle: 'wreckitcc', name: 'Wreck it Ralph' },
  { handle: 'marge_on_github', name: 'Marge Simpson' },
  { handle: 'patchsol', name: 'Ikea Monkey' },
  { handle: 'andrewwwsol', name: 'PUP' },
  { handle: 'sammy_crypt_', name: 'Sammy sendoor' },
  { handle: 'cryptogfishere', name: 'Nietzschean Dog' },
  { handle: 'smartiep4nts', name: 'pixel inu' },
  { handle: 'exchangenews', name: 'Emil the Seal' },
  { handle: 'himgajria', name: 'him' },
  { handle: 'mih4x', name: 'mih4' },
  { handle: 'tulsabws', name: 'Black Wallstreet' },
  { handle: 'spsccto', name: 'SPSC' },
  { handle: 'crubwifhat', name: 'Crub WifHat' },

  // Priority 4: OSINT-only projects (no AI analysis yet, trust_confidence=low)
  { handle: 'nullanetwork', name: 'NULLA' },
  { handle: 'kredopay', name: 'Kredo' },
  { handle: 'kingnet_ai', name: 'Kingnet AI' },
  { handle: 'bloxapi', name: 'BloxAPI' },
  { handle: 'orgo', name: 'Orgo' },
  { handle: 'ascenddotf', name: 'ascend' },
  { handle: 'thechromecock1', name: 'THE CHROME COCK' },
  { handle: 'privacydex', name: 'PrivacyDex' },
  { handle: 'aetheron402', name: 'Aetheron' },
  { handle: 'wladimiiir', name: 'AiderDesk' },
  { handle: 'theo_the_dev', name: 'rekill' },
  { handle: 'theroaringkitty', name: 'Roaring Kitty' },
  { handle: 'tf_global', name: 'Terraformation' },
  { handle: 'moltbook', name: 'Moltbot Cult' },
  { handle: 'offchaingoblin', name: 'CRAB-17' },
  { handle: 'ratpace', name: 'ratpace' },
  { handle: 'jaswalskibidi', name: 'Jaswal' },
  { handle: 'cryptoto12300', name: 'Cryptoto' },
  { handle: 'PumpClawd', name: 'PumpClawd' },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface ScanResult {
  handle: string;
  name: string;
  success: boolean;
  jobId?: string;
  status?: string;
  error?: string;
  duration?: number;
}

async function triggerRescan(
  handle: string
): Promise<{ jobId?: string; status?: string; error?: string }> {
  const url = `${BASE_URL}/api/xintel/scan`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ handle, force: true }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json();
}

async function waitForScanCompletion(
  jobId: string,
  maxWaitMs = 300_000
): Promise<string> {
  const start = Date.now();
  // Wait a bit before first poll to let scan process
  await sleep(15000);
  while (Date.now() - start < maxWaitMs) {
    const url = `${BASE_URL}/api/xintel/scan?jobId=${encodeURIComponent(jobId)}`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (
          data.status === 'complete' ||
          data.status === 'failed' ||
          data.status === 'cached'
        ) {
          return data.status;
        }
      }
    } catch {
      // Network error, retry
    }
    await sleep(10000);
  }
  return 'timeout';
}

async function main() {
  const subset = PROJECTS_TO_RESCAN.slice(
    START_INDEX,
    START_INDEX + LIMIT
  );

  console.log('='.repeat(60));
  console.log(`BATCH RESCAN - ${subset.length} projects`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Delay between scans: ${DELAY_SECONDS}s`);
  console.log(`Start index: ${START_INDEX}`);
  if (dryRun) console.log('*** DRY RUN - no scans will be triggered ***');
  console.log('='.repeat(60));
  console.log('');

  const results: ScanResult[] = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < subset.length; i++) {
    const { handle, name } = subset[i];
    const globalIndex = START_INDEX + i;
    const progress = `[${i + 1}/${subset.length}]`;

    console.log(
      `${progress} Scanning @${handle} (${name}) [global #${globalIndex}]...`
    );

    if (dryRun) {
      console.log(`  -> Would POST /api/xintel/scan { handle: "${handle}", force: true }`);
      console.log('');
      continue;
    }

    const startTime = Date.now();
    try {
      const result = await triggerRescan(handle);

      if (result.error) {
        console.log(`  ✗ Error: ${result.error}`);
        results.push({
          handle,
          name,
          success: false,
          error: result.error,
        });
        failCount++;
      } else if (result.jobId) {
        console.log(`  → Job started: ${result.jobId} (status: ${result.status})`);

        // Wait for completion
        const finalStatus = await waitForScanCompletion(result.jobId);
        const duration = Math.round((Date.now() - startTime) / 1000);
        console.log(`  ✓ Completed: ${finalStatus} (${duration}s)`);

        results.push({
          handle,
          name,
          success: finalStatus === 'complete',
          jobId: result.jobId,
          status: finalStatus,
          duration,
        });
        if (finalStatus === 'complete') successCount++;
        else failCount++;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  ✗ Failed: ${msg}`);
      results.push({ handle, name, success: false, error: msg });
      failCount++;
    }

    // Delay between scans (skip after last one)
    if (i < subset.length - 1) {
      console.log(`  ⏳ Waiting ${DELAY_SECONDS}s before next scan...`);
      await sleep(DELAY_SECONDS * 1000);
    }
    console.log('');
  }

  // Summary
  console.log('='.repeat(60));
  console.log('RESCAN COMPLETE');
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed:  ${failCount}`);
  console.log(`  Total:   ${subset.length}`);
  console.log('='.repeat(60));

  // Print failures for easy resume
  const failures = results.filter((r) => !r.success);
  if (failures.length > 0) {
    console.log('\nFailed handles (for retry):');
    failures.forEach((f) => {
      console.log(`  @${f.handle} - ${f.error || f.status}`);
    });
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
