/**
 * Mock WAL Failure Detector
 *
 * Mock skill implementation for contract testing wal-failure-detector.
 * Extracted from phase5-bridge-contracts.test.ts during Phase 6 Stage 1.
 */

import type {
  WALEntry,
  WALFailure,
  WALStatus,
} from '../../agentic/bridge/interfaces/proactive-agent';
import { getAdapter } from '../../agentic/bridge/adapters/factory';

export class MockWALFailureDetector {
  private static readonly VALID_STATUSES: WALStatus[] = [
    'PENDING', 'SUCCESS', 'ROLLBACK', 'TIMEOUT', 'CONFLICT'
  ];

  parseWALEntry(line: string, lineNumber: number): WALEntry | null {
    if (line.startsWith('#') || line.trim() === '') return null;

    const parts = line.split('|', 5);
    if (parts.length < 5) return null;

    const [timestamp, status, retryCount, action, metadataStr] = parts;

    if (!MockWALFailureDetector.VALID_STATUSES.includes(status as WALStatus)) {
      console.warn(`[WALParser] Invalid status '${status}' at line ${lineNumber}, skipping`);
      return null;
    }

    const retry_count = parseInt(retryCount, 10);
    if (isNaN(retry_count)) {
      console.warn(`[WALParser] Invalid retry_count '${retryCount}' at line ${lineNumber}, skipping`);
      return null;
    }

    let metadata: Record<string, unknown> | undefined;
    try {
      metadata = JSON.parse(metadataStr);
    } catch {
      metadata = {};
    }

    return {
      timestamp,
      status: status as WALStatus,
      retry_count,
      action,
      metadata,
      line_number: lineNumber,
    };
  }

  detectFailures(entries: WALEntry[]): WALFailure[] {
    const failures: WALFailure[] = [];

    for (const entry of entries) {
      if (entry.status === 'ROLLBACK') {
        failures.push({
          entry,
          signature: 'ROLLBACK',
          already_tracked: false,
          suggested_pattern: `rollback-${entry.action.split(' ')[0]}`,
          constraint_id: entry.metadata?.constraint as string,
        });
      } else if (entry.status === 'TIMEOUT') {
        failures.push({
          entry,
          signature: 'TIMEOUT',
          already_tracked: false,
          suggested_pattern: `timeout-${entry.action.split(' ')[0]}`,
        });
      } else if (entry.status === 'CONFLICT') {
        failures.push({
          entry,
          signature: 'CONFLICT',
          already_tracked: false,
          suggested_pattern: `conflict-${entry.action.split(' ')[0]}`,
        });
      } else if (entry.retry_count > 3) {
        failures.push({
          entry,
          signature: 'RETRY_EXCEEDED',
          already_tracked: false,
          suggested_pattern: `retry-exceeded-${entry.action.split(' ')[0]}`,
        });
      }
    }

    return failures;
  }

  async sendAlerts(failures: WALFailure[]): Promise<void> {
    const agent = getAdapter('proactive-agent');

    for (const failure of failures) {
      if (!failure.already_tracked) {
        await agent.sendAlert({
          constraint_id: failure.constraint_id || 'wal-failure',
          severity: failure.signature === 'ROLLBACK' ? 'critical' : 'warning',
          message: `${failure.signature}: ${failure.entry.action}`,
          action: 'Review with /wal-failure-detector patterns',
          timestamp: new Date().toISOString(),
        });
      }
    }
  }
}
