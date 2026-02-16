/**
 * Mock adapter for proactive-agent integration.
 *
 * This adapter is used for testing and development when the real
 * proactive-agent is not available.
 */

import type { HealthAlert, HealthCheckSummary } from '../interfaces/proactive-agent';

export class MockProactiveAgent {
  private receivedAlerts: HealthAlert[] = [];
  private receivedSummaries: HealthCheckSummary[] = [];

  /**
   * Send health alert (mock implementation).
   * Logs the alert and stores for verification.
   */
  async sendAlert(alert: HealthAlert): Promise<void> {
    console.log(
      `[MockProactiveAgent] Alert: ${alert.severity.toUpperCase()} - ` +
        `${alert.constraint_id}: ${alert.message}`
    );
    this.receivedAlerts.push(alert);
  }

  /**
   * Send health check summary (mock implementation).
   * Logs the summary and stores for verification.
   */
  async sendHealthSummary(summary: HealthCheckSummary): Promise<void> {
    console.log(
      `[MockProactiveAgent] Health Summary: ` +
        `${summary.counts.healthy} healthy, ` +
        `${summary.counts.warning} warnings, ` +
        `${summary.counts.critical} critical`
    );
    this.receivedSummaries.push(summary);
  }

  /**
   * Get all received alerts (for testing verification).
   */
  getReceivedAlerts(): HealthAlert[] {
    return this.receivedAlerts;
  }

  /**
   * Get all received summaries (for testing verification).
   */
  getReceivedSummaries(): HealthCheckSummary[] {
    return this.receivedSummaries;
  }

  /**
   * Clear all received data (for test cleanup).
   */
  clear(): void {
    this.receivedAlerts = [];
    this.receivedSummaries = [];
  }

  /**
   * Get alerts by severity (for testing).
   */
  getAlertsBySeverity(severity: 'critical' | 'warning' | 'info'): HealthAlert[] {
    return this.receivedAlerts.filter((a) => a.severity === severity);
  }
}
