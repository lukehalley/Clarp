'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Project } from '@/types/project';

// Import the shared detail page component
import EntityDetailPage from '@/components/terminal/EntityDetailPage';
import WalletGate from '@/components/auth/WalletGate';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
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
            // Redirect if not a project (or default)
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

        // Redirect if not a project (or default)
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
    };

    fetchProject();
  }, [projectId, router]);

  return (
    <WalletGate showPreview={true}>
      <EntityDetailPage
        project={project}
        isLoading={isLoading}
        expectedEntityType="project"
      />
    </WalletGate>
  );
}
