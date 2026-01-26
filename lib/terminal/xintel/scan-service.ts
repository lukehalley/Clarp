// X Intel Scan Service
// Handles scan job management and report generation
// Uses Grok with live X search (no separate X API needed)

import {
  ScanJob,
  ScanStatus,
  XIntelReport,
  SCAN_STATUS_PROGRESS,
} from '@/types/xintel';
import { getMockReport, getAvailableHandles } from './mock-data';
import { getGrokClient, isGrokAvailable, GrokApiError } from '@/lib/grok/client';
import { grokAnalysisToReport } from './transformers';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Check if real API mode is enabled (only needs Grok with x_search capability)
const USE_REAL_API = process.env.ENABLE_REAL_X_API === 'true'
  && isGrokAvailable();

// In-memory job storage (would be Redis/DB in production)
const scanJobs: Map<string, ScanJob> = new Map();

// Report cache (would be Redis/DB in production)
const reportCache: Map<string, { report: XIntelReport; cachedAt: Date }> = new Map();

// Default cache TTL: 6 hours
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

// Rate limiting (per handle)
const scanCooldowns: Map<string, Date> = new Map();
const COOLDOWN_MS = 60 * 1000; // 1 minute between scans of same handle

// ============================================================================
// PUBLIC API
// ============================================================================

export interface SubmitScanOptions {
  handle: string;
  depth?: number;
  force?: boolean;
}

export interface SubmitScanResult {
  jobId: string;
  status: ScanStatus;
  cached: boolean;
  error?: string;
  useRealApi?: boolean;
}

/**
 * Submit a new scan job
 */
export function submitScan(options: SubmitScanOptions): SubmitScanResult {
  const { handle, depth = 200, force = false } = options;
  const normalizedHandle = handle.toLowerCase().replace('@', '');

  // Check rate limiting
  const lastScan = scanCooldowns.get(normalizedHandle);
  if (lastScan && !force) {
    const elapsed = Date.now() - lastScan.getTime();
    if (elapsed < COOLDOWN_MS) {
      return {
        jobId: '',
        status: 'failed',
        cached: false,
        error: `Rate limited. Try again in ${Math.ceil((COOLDOWN_MS - elapsed) / 1000)} seconds.`,
      };
    }
  }

  // Check cache (unless force rescan)
  if (!force) {
    const cached = reportCache.get(normalizedHandle);
    if (cached) {
      const age = Date.now() - cached.cachedAt.getTime();
      if (age < CACHE_TTL_MS) {
        return {
          jobId: `cached_${normalizedHandle}`,
          status: 'cached',
          cached: true,
          useRealApi: cached.report.disclaimer.includes('AI-powered'),
        };
      }
    }
  }

  // Create new job
  const jobId = `job_${normalizedHandle}_${Date.now()}`;
  const job: ScanJob = {
    id: jobId,
    handle: normalizedHandle,
    depth,
    status: 'queued',
    progress: 0,
    startedAt: new Date(),
  };

  scanJobs.set(jobId, job);
  scanCooldowns.set(normalizedHandle, new Date());

  // Start processing asynchronously
  processScanJob(jobId);

  return {
    jobId,
    status: 'queued',
    cached: false,
    useRealApi: USE_REAL_API,
  };
}

/**
 * Get scan job status
 */
export function getScanJob(jobId: string): ScanJob | null {
  return scanJobs.get(jobId) || null;
}

/**
 * Get cached report
 */
export function getCachedReport(handle: string): XIntelReport {
  const normalizedHandle = handle.toLowerCase().replace('@', '');

  // First check our cache
  const cached = reportCache.get(normalizedHandle);
  if (cached) {
    const age = Date.now() - cached.cachedAt.getTime();
    if (age < CACHE_TTL_MS) {
      return cached.report;
    }
  }

  // Fall back to mock/generated data (always returns a report)
  return getMockReport(normalizedHandle);
}

/**
 * Check if handle has available mock data
 */
export function hasAvailableData(handle: string): boolean {
  const normalizedHandle = handle.toLowerCase().replace('@', '');
  return getAvailableHandles().includes(normalizedHandle);
}

/**
 * Check if real API mode is enabled
 */
export function isRealApiEnabled(): boolean {
  return USE_REAL_API;
}

// ============================================================================
// SCAN PROCESSING
// ============================================================================

/**
 * Process a scan job through the pipeline
 * Uses real X API + Grok if configured, otherwise falls back to mock data
 */
async function processScanJob(jobId: string): Promise<void> {
  const job = scanJobs.get(jobId);
  if (!job) return;

  try {
    if (USE_REAL_API) {
      await processRealScan(job);
    } else {
      await processMockScan(job);
    }
  } catch (error) {
    console.error(`Scan job ${jobId} failed:`, error);
    job.status = 'failed';
    job.error = error instanceof Error ? error.message : 'Unknown error';
    scanJobs.set(jobId, job);

    // Fall back to mock data on error
    try {
      const report = getMockReport(job.handle);
      report.scanTime = new Date();
      report.cached = false;
      report.disclaimer = 'Scan failed, showing cached/generated data. ' + report.disclaimer;
      reportCache.set(job.handle, { report, cachedAt: new Date() });
    } catch {
      // Ignore fallback errors
    }
  }
}

/**
 * Process scan using Grok with live X search
 * Grok handles all data fetching via x_search and web_search tools
 */
async function processRealScan(job: ScanJob): Promise<void> {
  const grokClient = getGrokClient();

  // Stage 1: Starting analysis
  updateJobStatus(job, 'fetching', 10);

  // Stage 2: Grok analyzes the profile using x_search
  updateJobStatus(job, 'analyzing', 30);
  const analysis = await grokClient.analyzeProfile(job.handle);

  // Stage 3: Build report from Grok analysis
  updateJobStatus(job, 'scoring', 80);
  const report = grokAnalysisToReport(analysis);

  // Stage 4: Complete
  updateJobStatus(job, 'complete', 100);
  job.completedAt = new Date();
  scanJobs.set(job.id, job);

  // Cache the report
  reportCache.set(job.handle, {
    report,
    cachedAt: new Date(),
  });
}

/**
 * Process scan using mock data (fallback mode)
 */
async function processMockScan(job: ScanJob): Promise<void> {
  const stages: { status: ScanStatus; delay: number }[] = [
    { status: 'fetching', delay: 800 },
    { status: 'extracting', delay: 600 },
    { status: 'analyzing', delay: 700 },
    { status: 'scoring', delay: 500 },
    { status: 'complete', delay: 0 },
  ];

  for (const stage of stages) {
    updateJobStatus(job, stage.status);

    if (stage.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, stage.delay));
    }
  }

  // Generate report (using mock/generated data)
  const report = getMockReport(job.handle);

  // Update report with actual scan time
  report.scanTime = new Date();
  report.cached = false;
  report.disclaimer = 'DEMO MODE: ' + report.disclaimer;

  // Cache the report
  reportCache.set(job.handle, {
    report,
    cachedAt: new Date(),
  });

  job.completedAt = new Date();
  scanJobs.set(job.id, job);
}

/**
 * Update job status and progress
 */
function updateJobStatus(job: ScanJob, status: ScanStatus, progress?: number): void {
  job.status = status;
  job.progress = progress ?? SCAN_STATUS_PROGRESS[status];
  scanJobs.set(job.id, job);
}

// ============================================================================
// SHARE LINKS
// ============================================================================

// Share link storage (would be DB in production)
const shareLinks: Map<string, { handle: string; expiresAt: Date }> = new Map();

export interface CreateShareLinkResult {
  url: string;
  shareId: string;
  expiresAt: Date;
}

/**
 * Create a shareable link for a report
 */
export function createShareLink(handle: string): CreateShareLinkResult {
  const normalizedHandle = handle.toLowerCase().replace('@', '');
  const shareId = `share_${normalizedHandle}_${Date.now().toString(36)}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  shareLinks.set(shareId, {
    handle: normalizedHandle,
    expiresAt,
  });

  return {
    url: `/terminal/xintel/${normalizedHandle}?share=${shareId}`,
    shareId,
    expiresAt,
  };
}

/**
 * Validate a share link
 */
export function validateShareLink(shareId: string): { valid: boolean; handle?: string } {
  const link = shareLinks.get(shareId);

  if (!link) {
    return { valid: false };
  }

  if (link.expiresAt < new Date()) {
    shareLinks.delete(shareId);
    return { valid: false };
  }

  return { valid: true, handle: link.handle };
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get cache age in seconds
 */
export function getCacheAge(handle: string): number | null {
  const normalizedHandle = handle.toLowerCase().replace('@', '');
  const cached = reportCache.get(normalizedHandle);

  if (!cached) return null;

  return Math.floor((Date.now() - cached.cachedAt.getTime()) / 1000);
}

/**
 * Clear cache for a handle
 */
export function clearCache(handle: string): void {
  const normalizedHandle = handle.toLowerCase().replace('@', '');
  reportCache.delete(normalizedHandle);
}

/**
 * Get all active jobs (for admin/monitoring)
 */
export function getActiveJobs(): ScanJob[] {
  return Array.from(scanJobs.values())
    .filter(job => job.status !== 'complete' && job.status !== 'failed')
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
}

/**
 * Get API configuration status (for debugging/admin)
 */
export function getApiStatus(): {
  grokConfigured: boolean;
  realApiEnabled: boolean;
} {
  return {
    grokConfigured: isGrokAvailable(),
    realApiEnabled: USE_REAL_API,
  };
}
