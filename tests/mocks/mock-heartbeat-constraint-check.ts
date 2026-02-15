/**
 * Mock Heartbeat Constraint Check
 *
 * Mock skill implementation for contract testing heartbeat-constraint-check.
 * Extracted from phase5-bridge-contracts.test.ts during Phase 6 Stage 1.
 */

import type {
  HealthAlert,
  ConstraintHealth,
  HealthCheckSummary,
} from '../../agentic/bridge/interfaces/proactive-agent';
import { getAdapter } from '../../agentic/bridge/adapters/factory';

export class MockHeartbeatConstraintCheck {
  private constraints: Map<
    string,
    {
      file_exists: boolean;
      schema_valid: boolean;
      scope_files: string[];
      effectiveness: number;
    }
  > = new Map();

  addConstraint(
    id: string,
    config: {
      file_exists?: boolean;
      schema_valid?: boolean;
      scope_files?: string[];
      effectiveness?: number;
    }
  ): void {
    this.constraints.set(id, {
      file_exists: config.file_exists ?? true,
      schema_valid: config.schema_valid ?? true,
      scope_files: config.scope_files ?? ['src/main.ts'],
      effectiveness: config.effectiveness ?? 0.9,
    });
  }

  checkConstraint(id: string): ConstraintHealth {
    const config = this.constraints.get(id);
    if (!config) {
      return {
        constraint_id: id,
        status: 'critical',
        checks: {
          file_exists: false,
          schema_valid: false,
          scope_relevant: false,
          effectiveness_ok: false,
        },
        alert: {
          constraint_id: id,
          severity: 'critical',
          message: 'Constraint not found',
          action: 'Check constraint ID or restore file',
          timestamp: new Date().toISOString(),
        },
      };
    }

    const checks = {
      file_exists: config.file_exists,
      schema_valid: config.schema_valid,
      scope_relevant: config.scope_files.length > 0,
      effectiveness_ok: config.effectiveness > 0.5,
    };

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    let alert: HealthAlert | undefined;

    if (!checks.file_exists || !checks.schema_valid) {
      status = 'critical';
      alert = {
        constraint_id: id,
        severity: 'critical',
        message: !checks.file_exists ? 'File missing' : 'Schema invalid',
        action: 'Restore or fix constraint file',
        timestamp: new Date().toISOString(),
      };
    } else if (!checks.scope_relevant || !checks.effectiveness_ok) {
      status = 'warning';
      alert = {
        constraint_id: id,
        severity: 'warning',
        message: !checks.scope_relevant ? 'Scope drift detected' : 'Low effectiveness',
        action: 'Review constraint scope or trigger conditions',
        timestamp: new Date().toISOString(),
        context: {
          effectiveness: config.effectiveness,
          scope_files: config.scope_files,
        },
      };
    }

    return { constraint_id: id, status, checks, alert };
  }

  async runHealthCheck(): Promise<HealthCheckSummary> {
    const start = Date.now();
    const results: ConstraintHealth[] = [];

    for (const id of this.constraints.keys()) {
      results.push(this.checkConstraint(id));
    }

    const counts = {
      total: results.length,
      healthy: results.filter((r) => r.status === 'healthy').length,
      warning: results.filter((r) => r.status === 'warning').length,
      critical: results.filter((r) => r.status === 'critical').length,
    };

    const summary: HealthCheckSummary = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      execution_time_ms: Date.now() - start,
      counts,
      constraints: results,
      next_check: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };

    const agent = getAdapter('proactive-agent');
    await agent.sendHealthSummary(summary);

    return summary;
  }
}
