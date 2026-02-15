/**
 * Mock adapter for VFM (Value Function Model) system integration.
 *
 * This adapter is used for testing and development when the real
 * VFM system is not available.
 */

import type { VFMScore, VFMRanking } from '../interfaces/vfm-system';

export class MockVFMSystem {
  private receivedScores: VFMScore[] = [];
  private receivedRankings: VFMRanking[] = [];

  /**
   * Submit a constraint score (mock implementation).
   * Logs the score and stores for verification.
   */
  async submitScore(score: VFMScore): Promise<void> {
    console.log(
      `[MockVFMSystem] Score: ${score.constraint_name} = ` +
        `${score.value_score.toFixed(3)} (${score.quality}, ${score.percentile}th percentile)`
    );
    this.receivedScores.push(score);
  }

  /**
   * Submit a full ranking (mock implementation).
   * Logs the ranking summary and stores for verification.
   */
  async submitRanking(ranking: VFMRanking): Promise<void> {
    console.log(
      `[MockVFMSystem] Ranking submitted: ${ranking.total_scored} constraints scored`
    );
    if (ranking.rankings.length > 0) {
      const top = ranking.rankings[0];
      console.log(
        `[MockVFMSystem] Top constraint: ${top.constraint_name} = ${top.value_score.toFixed(3)}`
      );
    }
    this.receivedRankings.push(ranking);
  }

  /**
   * Get all received scores (for testing verification).
   */
  getReceivedScores(): VFMScore[] {
    return this.receivedScores;
  }

  /**
   * Get all received rankings (for testing verification).
   */
  getReceivedRankings(): VFMRanking[] {
    return this.receivedRankings;
  }

  /**
   * Clear all received data (for test cleanup).
   */
  clear(): void {
    this.receivedScores = [];
    this.receivedRankings = [];
  }

  /**
   * Get scores by quality level (for testing).
   */
  getScoresByQuality(quality: 'high' | 'medium' | 'low'): VFMScore[] {
    return this.receivedScores.filter((s) => s.quality === quality);
  }
}
