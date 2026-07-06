import React, { useState, useEffect } from 'react';
import type { Dataset, TriggerRule, TriggeredAlert, TriggerCondition } from '../types';
import { AlertTriangle, Plus, Trash2, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { parseNumber } from '../utils/financialEngine';

interface TriggerManagerProps {
  dataset: Dataset;
  rules: TriggerRule[];
  onRulesChange: (newRules: TriggerRule[]) => void;
  triggeredAlerts: TriggeredAlert[];
  onTriggeredAlertsChange: (alerts: TriggeredAlert[]) => void;
}

export const TriggerManager: React.FC<TriggerManagerProps> = ({
  dataset,
  rules,
  onRulesChange,
  triggeredAlerts,
  onTriggeredAlertsChange
}) => {
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleColumn, setNewRuleColumn] = useState('');
  const [newRuleCondition, setNewRuleCondition] = useState<TriggerCondition>('gt');
  const [newRuleThreshold, setNewRuleThreshold] = useState('');
  const [newRuleSeverity, setNewRuleSeverity] = useState<'info' | 'warning' | 'critical'>('warning');

  // Evaluate rules against the dataset
  useEffect(() => {
    if (!dataset || dataset.data.length === 0) {
      onTriggeredAlertsChange([]);
      return;
    }

    const alerts: TriggeredAlert[] = [];
    const dateCol = dataset.columnMapping.dateKey;

    rules.forEach(rule => {
      // Rule 1: Numeric threshold checks (gt, lt, eq)
      if (rule.condition === 'gt' || rule.condition === 'lt' || rule.condition === 'eq') {
        dataset.data.forEach((row, idx) => {
          const val = parseNumber(row[rule.column]);
          let isTriggered = false;

          if (rule.condition === 'gt' && val > rule.threshold) isTriggered = true;
          if (rule.condition === 'lt' && val < rule.threshold) isTriggered = true;
          if (rule.condition === 'eq' && val === rule.threshold) isTriggered = true;

          if (isTriggered) {
            const dateStr = row[dateCol] ? ` on ${row[dateCol]}` : ` (row ${idx + 1})`;
            alerts.push({
              id: `${rule.id}-${idx}`,
              ruleId: rule.id,
              ruleName: rule.name,
              severity: rule.severity,
              value: val,
              rowIdx: idx,
              timestamp: new Date().toLocaleTimeString(),
              message: `Threshold breached${dateStr}: "${rule.column}" reached $${val.toLocaleString()} (Target: ${rule.condition === 'gt' ? '>' : rule.condition === 'lt' ? '<' : '='} $${rule.threshold.toLocaleString()})`
            });
          }
        });
      }

      // Rule 2: Chronological growth check (negative growth check)
      if (rule.condition === 'neg-growth') {
        // Sort chronologically
        const sorted = [...dataset.data].sort((a, b) => {
          const dateA = a[dateCol] ? new Date(a[dateCol]).getTime() : 0;
          const dateB = b[dateCol] ? new Date(b[dateCol]).getTime() : 0;
          return dateA - dateB;
        });

        for (let i = 1; i < sorted.length; i++) {
          const prevVal = parseNumber(sorted[i - 1][rule.column]);
          const currentVal = parseNumber(sorted[i][rule.column]);
          
          if (prevVal > 0 && currentVal < prevVal) {
            const dropPercent = ((prevVal - currentVal) / prevVal) * 100;
            if (dropPercent > rule.threshold) {
              const dateStr = sorted[i][dateCol] ? ` in ${sorted[i][dateCol]}` : ` (row ${i + 1})`;
              alerts.push({
                id: `${rule.id}-growth-${i}`,
                ruleId: rule.id,
                ruleName: rule.name,
                severity: rule.severity,
                value: currentVal,
                timestamp: new Date().toLocaleTimeString(),
                message: `Negative growth breach${dateStr}: "${rule.column}" dropped by ${dropPercent.toFixed(1)}% (Threshold: > ${rule.threshold}%)`
              });
            }
          }
        }
      }
    });

    onTriggeredAlertsChange(alerts);
  }, [dataset, rules]);

  // Set default column select
  useEffect(() => {
    if (dataset && dataset.headers.length > 0 && !newRuleColumn) {
      setNewRuleColumn(dataset.headers[0]);
    }
  }, [dataset]);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim() || !newRuleColumn) return;

    const threshold = parseFloat(newRuleThreshold) || 0;
    const rule: TriggerRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName,
      column: newRuleColumn,
      condition: newRuleCondition,
      threshold,
      severity: newRuleSeverity
    };

    onRulesChange([...rules, rule]);
    setNewRuleName('');
    setNewRuleThreshold('');
  };

  const handleDeleteRule = (id: string) => {
    onRulesChange(rules.filter(r => r.id !== id));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      
      {/* Create / Manage Rules Panel */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} style={{ color: 'var(--primary)' }} />
          Define Custom Alert Rules
        </h3>
        
        <form onSubmit={handleAddRule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Rule Description / Name</label>
            <input
              type="text"
              placeholder="e.g. Low Revenue Alert"
              value={newRuleName}
              onChange={(e) => setNewRuleName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Target Column</label>
              <select
                value={newRuleColumn}
                onChange={(e) => setNewRuleColumn(e.target.value)}
                className="form-select"
              >
                {dataset.headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Alert Severity</label>
              <select
                value={newRuleSeverity}
                onChange={(e) => setNewRuleSeverity(e.target.value as any)}
                className="form-select"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Condition</label>
              <select
                value={newRuleCondition}
                onChange={(e) => setNewRuleCondition(e.target.value as TriggerCondition)}
                className="form-select"
              >
                <option value="gt">Greater Than (&gt;)</option>
                <option value="lt">Less Than (&lt;)</option>
                <option value="eq">Equals (=)</option>
                <option value="neg-growth">Drop Margin % (Neg Growth)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>{newRuleCondition === 'neg-growth' ? 'Threshold Percentage (%)' : 'Threshold Amount ($)'}</label>
              <input
                type="number"
                placeholder={newRuleCondition === 'neg-growth' ? 'e.g. 5' : 'e.g. 10000'}
                value={newRuleThreshold}
                onChange={(e) => setNewRuleThreshold(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
            <Plus size={16} /> Save Trigger Rule
          </button>
        </form>

        {/* Existing Rules List */}
        <div>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>Active Rules ({rules.length})</h4>
          {rules.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              No custom alert rules configured yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(0,0,0,0.01)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{rule.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      If {rule.column} {rule.condition === 'gt' ? '>' : rule.condition === 'lt' ? '<' : rule.condition === 'eq' ? '=' : 'dropped >'} {rule.condition === 'neg-growth' ? `${rule.threshold}%` : `$${rule.threshold.toLocaleString()}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`alert-badge alert-${rule.severity}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>{rule.severity}</span>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="btn btn-secondary btn-icon"
                      style={{ padding: '0.2rem', border: 'none', color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Triggered Alerts Log */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={18} style={{ color: 'var(--status-critical)' }} />
          Alert Audit Log ({triggeredAlerts.length})
        </h3>
        
        {triggeredAlerts.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--status-success)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '2rem' }}>
            <CheckCircle2 size={36} />
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>All Systems Healthy</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No alert triggers activated.</span>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '460px' }}>
            {triggeredAlerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: alert.severity === 'critical' ? 'var(--status-critical-bg)' : alert.severity === 'warning' ? 'var(--status-warning-bg)' : 'var(--status-info-bg)',
                  borderLeft: `4px solid var(--status-${alert.severity})`
                }}
              >
                <AlertTriangle size={16} style={{ color: `var(--status-${alert.severity})`, marginTop: '0.1rem' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>{alert.ruleName}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{alert.timestamp}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.3 }}>{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
