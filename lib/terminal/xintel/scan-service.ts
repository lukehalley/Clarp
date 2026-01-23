// X Intel Scan Service
// Handles scan job management and report generation

import {
  ScanJob,
  ScanStatus,
  XIntelReport,
  SCAN_STATUS_PROGRESS,
} from '@/types/xintel';
import { getMockReport, getAvailableHandles } from './mock-data';

// ============================================================================
// SCAN JOB MANAGEMENT
// ============================================================================

// In-memory job storage (would be Redis/DB in production)
const scanJobs: Map<string, ScanJob> = new Map();

// Report cache (would be Redis/DB in production)
const reportCache: Map<string, { report: XIntelReport; cachedAt: Date }> = new Map();

// Default cache TTL: 6 hours
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

// Rate limiting (per handle)
const scanCooldowns: Map<string, Date> = new Map();
const COOLDOWN_MS = 60 * 1000; // 1 minute between scans of same handle

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
}

/**
 * Submit a new scan job
 */
export function submitScan(options: SubmitScanOptions): SubmitScanResult {
  const { handle, depth = 800, force = false } = options;
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

  // Start processing asynchronously (simulated)
  processScanJob(jobId);

  return {
    jobId,
    status: 'queued',
    cached: false,
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

// ============================================================================
// SCAN PROCESSING (SIMULATED)
// ============================================================================

/**
 * Process a scan job through the pipeline
 * In production this would call real X API and ML services
 */
async function processScanJob(jobId: string): Promise<void> {
  const job = scanJobs.get(jobId);
  if (!job) return;

  const stages: { status: ScanStatus; delay: number }[] = [
    { status: 'fetching', delay: 800 },
    { status: 'extracting', delay: 600 },
    { status: 'analyzing', delay: 700 },
    { status: 'scoring', delay: 500 },
    { status: 'complete', delay: 0 },
  ];

  for (const stage of stages) {
    // Update job status
    job.status = stage.status;
    job.progress = SCAN_STATUS_PROGRESS[stage.status];
    scanJobs.set(jobId, job);

    if (stage.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, stage.delay));
    }
  }

  // Generate report (using mock/generated data)
  const report = getMockReport(job.handle);

  // Update report with actual scan time
  report.scanTime = new Date();
  report.cached = false;

  // Cache the report
  reportCache.set(job.handle, {
    report,
    cachedAt: new Date(),
  });

  job.completedAt = new Date();
  scanJobs.set(jobId, job);
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
