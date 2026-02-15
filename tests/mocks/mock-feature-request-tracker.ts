/**
 * Mock Feature Request Tracker
 *
 * Mock skill implementation for contract testing feature-request-tracker.
 * Extracted from phase5-bridge-contracts.test.ts during Phase 6 Stage 1.
 */

export class MockFeatureRequestTracker {
  private requests: Map<
    string,
    { description: string; observations: string[]; sources: number; created: Date }
  > = new Map();

  private nextId = 1;

  add(description: string): string {
    const id = `FR-2026-${String(this.nextId++).padStart(3, '0')}`;
    this.requests.set(id, {
      description,
      observations: [],
      sources: 1,
      created: new Date(),
    });
    return id;
  }

  link(id: string, observationSlug: string): boolean {
    const request = this.requests.get(id);
    if (!request) return false;
    if (!request.observations.includes(observationSlug)) {
      request.observations.push(observationSlug);
    }
    return true;
  }

  calculatePriority(id: string): number {
    const request = this.requests.get(id);
    if (!request) return 0;

    const linkedScore = request.observations.length * 2;
    const sourceScore = request.sources;
    const daysSinceCreation = Math.floor(
      (Date.now() - request.created.getTime()) / (1000 * 60 * 60 * 24)
    );
    const recencyBonus = daysSinceCreation < 7 ? 3 : daysSinceCreation < 30 ? 2 : daysSinceCreation < 90 ? 1 : 0;

    return linkedScore + sourceScore + recencyBonus;
  }

  getPriorityLevel(id: string): 'high' | 'medium' | 'low' {
    const score = this.calculatePriority(id);
    if (score >= 10) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  }

  getRequest(id: string) {
    return this.requests.get(id);
  }
}
