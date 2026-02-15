/**
 * Mock Learnings N-Counter
 *
 * Mock skill implementation for contract testing learnings-n-counter.
 * Extracted from phase5-bridge-contracts.test.ts during Phase 6 Stage 1.
 */

import type {
  LearningsExport,
  Learning,
  LearningsQuery,
} from '../../agentic/bridge/interfaces/self-improving-agent';
import { getAdapter } from '../../agentic/bridge/adapters/factory';

export class MockLearningsNCounter {
  private observations: Map<string, { nCount: number; category?: string; summary: string }> =
    new Map();

  addObservation(id: string, nCount: number, summary: string, category?: string): void {
    this.observations.set(id, { nCount, category, summary });
  }

  summarize(query: LearningsQuery): LearningsExport {
    const minN = query.min_n_count || 3;
    const learnings: Learning[] = [];

    for (const [id, obs] of this.observations) {
      if (obs.nCount >= minN) {
        if (query.category && obs.category !== query.category) continue;

        learnings.push({
          id: `learning-${id}`,
          observation_id: id,
          n_count: obs.nCount,
          summary: obs.summary,
          category: obs.category,
          constraint_id: `cst-${id}`,
          prevention_rate: 0.95,
          related_observations: [],
        });
      }
    }

    return {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      min_n_count: minN,
      total_count: learnings.length,
      learnings,
    };
  }

  async exportToAgent(): Promise<void> {
    const agent = getAdapter('self-improving-agent');
    const learnings = this.summarize({ min_n_count: 3 });
    await agent.consumeLearnings(learnings);
  }
}
