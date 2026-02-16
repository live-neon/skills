/**
 * Mock adapter for self-improving-agent integration.
 *
 * This adapter is used for testing and development when the real
 * self-improving-agent is not available.
 */

import type { LearningsExport } from '../interfaces/self-improving-agent';

export class MockSelfImprovingAgent {
  private receivedLearnings: LearningsExport[] = [];

  /**
   * Consume learnings export (mock implementation).
   * Logs the learnings count and stores for verification.
   */
  async consumeLearnings(learnings: LearningsExport): Promise<void> {
    console.log(
      `[MockSelfImprovingAgent] Received ${learnings.total_count} learnings ` +
        `(version: ${learnings.version}, min_n: ${learnings.min_n_count})`
    );
    this.receivedLearnings.push(learnings);
  }

  /**
   * Get all received learnings (for testing verification).
   */
  getReceivedLearnings(): LearningsExport[] {
    return this.receivedLearnings;
  }

  /**
   * Clear received learnings (for test cleanup).
   * Finding #12: Standardized method name across all mock adapters.
   */
  clear(): void {
    this.receivedLearnings = [];
  }

  /**
   * Check if learnings were received (for testing).
   */
  hasReceivedLearnings(): boolean {
    return this.receivedLearnings.length > 0;
  }
}
