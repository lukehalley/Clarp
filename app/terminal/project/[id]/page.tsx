'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import type { Project } from '@/types/project';

import EntityDetailPage from '@/components/terminal/EntityDetailPage';
import ScanProgressIndicator from '@/components/terminal/ScanProgressIndicator';
import WalletGate from '@/components/auth/WalletGate';

const SCAN_POLL_INTERVAL = 3000;

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const scanJobId = searchParams.get('scanJob');

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scanActive, setScanActive] = useState(!!scanJobId);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      const [res_raw] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        new Promise(r => setTimeout(r, 2000)), // min loader display
      ]);
      let res = res_raw;

      if (!res.ok && res.status === 404) {
        res = await fetch(`/api/projects?q=${encodeURIComponent(projectId)}`);
        const data = await res.json();
        if (data.projects && data.projects.length > 0) {
          const entity = data.projects[0];
          if (entity.entityType === 'person') {
            router.replace(`/terminal/person/${entity.xHandle || entity.id}`);
            return;
          }
          if (entity.entityType === 'organization') {
            router.replace(`/terminal/org/${entity.xHandle || entity.id}`);
            return;
          }
          setProject(entity);
          return;
        }
        setProject(null);
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch project');
      const data = await res.json();
      const entity = data.project || data;

      if (entity.entityType === 'person') {
        router.replace(`/terminal/person/${entity.xHandle || entity.id}`);
        return;
      }
      if (entity.entityType === 'organization') {
        router.replace(`/terminal/org/${entity.xHandle || entity.id}`);
        return;
      }

      setProject(entity);
    } catch (err) {
      console.error('[ProjectPage] Failed to fetch:', err);
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, router]);

  // Wait for scan to complete before fetching project data
  useEffect(() => {
    if (!scanJobId || !scanActive) {
      fetchProject();
      return;
    }

    // Scan is active — poll until done, then fetch fresh data
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/xintel/scan?jobId=${scanJobId}`);
        if (!res.ok) {
          // Job not found or error — stop waiting, fetch whatever we have
          setScanActive(false);
          return;
        }
        const data = await res.json();
        if (data.status === 'complete' || data.status === 'cached' || data.status === 'failed') {
          if (!cancelled) setScanActive(false);
        }
      } catch {
        if (!cancelled) setScanActive(false);
      }
    };

    poll();
    const interval = setInterval(poll, SCAN_POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [scanJobId, scanActive, fetchProject]);

  // When scan finishes, clean the URL
  const handleScanComplete = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('scanJob');
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);

  return (
    <WalletGate showPreview={true}>
      <EntityDetailPage
        project={project}
        isLoading={isLoading || scanActive}
        expectedEntityType="project"
      />
      {scanJobId && (
        <ScanProgressIndicator
          scanJobId={scanJobId}
          onComplete={handleScanComplete}
        />
      )}
    </WalletGate>
  );
}
