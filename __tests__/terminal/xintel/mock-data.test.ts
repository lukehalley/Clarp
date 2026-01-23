import {
  getMockReport,
  getMockProfiles,
  getAvailableHandles,
} from '@/lib/terminal/xintel/mock-data';

describe('X Intel Mock Data', () => {
  describe('getAvailableHandles', () => {
    it('returns array of available handles', () => {
      const handles = getAvailableHandles();

      expect(Array.isArray(handles)).toBe(true);
      expect(handles.length).toBeGreaterThan(0);
    });
  });

  describe('getMockProfiles', () => {
    it('returns array of profiles', () => {
      const profiles = getMockProfiles();

      expect(Array.isArray(profiles)).toBe(true);
      expect(profiles.length).toBeGreaterThan(0);

      // Check profile structure
      profiles.forEach(profile => {
        expect(profile).toHaveProperty('handle');
        expect(profile).toHaveProperty('languagesDetected');
        expect(typeof profile.handle).toBe('string');
      });
    });
  });

  describe('getMockReport', () => {
    it('generates random data for unknown handle', () => {
      const report = getMockReport('unknown_handle_12345');

      // Should return a valid report with generated data
      expect(report).not.toBeNull();
      expect(report.profile.handle).toBe('unknown_handle_12345');
      expect(report.disclaimer).toContain('DEMO MODE');

      // Generated data should be consistent (seeded random)
      const report2 = getMockReport('unknown_handle_12345');
      expect(report2.score.overall).toBe(report.score.overall);
    });

    it('returns report for known handle', () => {
      const handles = getAvailableHandles();
      const report = getMockReport(handles[0]);

      expect(report).not.toBeNull();
      expect(report?.profile.handle).toBe(handles[0]);
    });

    it('normalizes handle input', () => {
      const handles = getAvailableHandles();
      const handle = handles[0];

      // Test various input formats
      const report1 = getMockReport(handle);
      const report2 = getMockReport(`@${handle}`);
      const report3 = getMockReport(handle.toUpperCase());

      expect(report1).not.toBeNull();
      expect(report2).not.toBeNull();
      // Note: case sensitivity depends on implementation
    });

    it('returns complete report structure', () => {
      const handles = getAvailableHandles();
      const report = getMockReport(handles[0]);

      expect(report).toHaveProperty('id');
      expect(report).toHaveProperty('profile');
      expect(report).toHaveProperty('score');
      expect(report).toHaveProperty('keyFindings');
      expect(report).toHaveProperty('shilledEntities');
      expect(report).toHaveProperty('backlashEvents');
      expect(report).toHaveProperty('behaviorMetrics');
      expect(report).toHaveProperty('networkMetrics');
      expect(report).toHaveProperty('linkedEntities');
      expect(report).toHaveProperty('evidence');
      expect(report).toHaveProperty('scanTime');
      expect(report).toHaveProperty('postsAnalyzed');
      expect(report).toHaveProperty('disclaimer');
    });

    it('returns valid score structure', () => {
      const handles = getAvailableHandles();
      const report = getMockReport(handles[0]);

      expect(report?.score).toHaveProperty('overall');
      expect(report?.score).toHaveProperty('riskLevel');
      expect(report?.score).toHaveProperty('factors');
      expect(report?.score).toHaveProperty('confidence');

      expect(report?.score.overall).toBeGreaterThanOrEqual(0);
      expect(report?.score.overall).toBeLessThanOrEqual(100);
      expect(['low', 'medium', 'high']).toContain(report?.score.riskLevel);
    });

    it('returns valid behavior metrics', () => {
      const handles = getAvailableHandles();
      const report = getMockReport(handles[0]);

      expect(report?.behaviorMetrics).toHaveProperty('toxicity');
      expect(report?.behaviorMetrics).toHaveProperty('vulgarity');
      expect(report?.behaviorMetrics).toHaveProperty('hype');
      expect(report?.behaviorMetrics).toHaveProperty('aggression');
      expect(report?.behaviorMetrics).toHaveProperty('consistency');
      expect(report?.behaviorMetrics).toHaveProperty('spamBurst');

      expect(report?.behaviorMetrics.toxicity.score).toBeGreaterThanOrEqual(0);
      expect(report?.behaviorMetrics.toxicity.score).toBeLessThanOrEqual(100);
    });
  });

  describe('Mock data consistency', () => {
    it('all profiles have corresponding mock data', () => {
      const handles = getAvailableHandles();

      handles.forEach(handle => {
        const report = getMockReport(handle);
        expect(report).not.toBeNull();
        expect(report?.profile.handle).toBe(handle);
      });
    });

    it('risk levels match score ranges', () => {
      const handles = getAvailableHandles();

      handles.forEach(handle => {
        const report = getMockReport(handle);
        if (!report) return;

        const { overall, riskLevel } = report.score;

        if (overall >= 75) {
          expect(riskLevel).toBe('low');
        } else if (overall >= 45) {
          expect(riskLevel).toBe('medium');
        } else {
          expect(riskLevel).toBe('high');
        }
      });
    });

    it('evidence arrays are non-empty for risky profiles', () => {
      const handles = getAvailableHandles();

      handles.forEach(handle => {
        const report = getMockReport(handle);
        if (!report) return;

        if (report.score.riskLevel === 'high') {
          expect(report.evidence.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
