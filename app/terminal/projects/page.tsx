'use client';

import { useState, useEffect } from 'react';
import IntelCard from '@/components/terminal/IntelCard';
import { Project, LarpScore } from '@/types/terminal';

// Empty data - TODO: Replace with real data source
function getAllProjects(): { project: Project; score: LarpScore; delta?: number }[] { return []; }

export default function TerminalProjects() {
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<{ project: Project; score: LarpScore; delta?: number }[]>([]);

  useEffect(() => {
    setMounted(true);
    setProjects(getAllProjects());
  }, []);

  if (!mounted) return null;

  return (
    <div>
      {projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map(({ project, score, delta }) => (
            <IntelCard
              key={project.id}
              project={project}
              score={score}
              scoreDelta24h={delta}
            />
          ))}
        </div>
      ) : (
        <div className="border-2 border-ivory-light/20 bg-ivory-light/5 p-8 text-center">
          <p className="text-ivory-light/50 font-mono">No projects available</p>
          <p className="mt-2 text-ivory-light/30 font-mono text-sm">
            Projects will appear here once data sources are connected.
          </p>
        </div>
      )}
    </div>
  );
}
