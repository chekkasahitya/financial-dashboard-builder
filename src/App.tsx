import { useState, useEffect } from 'react';
import type { Dataset, DashboardConfig, TriggerRule, TriggeredAlert } from './types';
import { DatasetUploader } from './components/DatasetUploader';
import { DashboardGrid } from './components/DashboardGrid';
import { Configurator } from './components/Configurator';
import { RefreshCw, Moon, Sun, BarChart3 } from 'lucide-react';
import { parseNumber } from './utils/financialEngine';

function App() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [config, setConfig] = useState<DashboardConfig>({
    theme: 'sapphire',
    isDarkMode: false,
    style: 'grid',
    widgets: []
  });
  const [rules, setRules] = useState<TriggerRule[]>([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState<TriggeredAlert[]>([]);

  // Apply visual theme class and mode attributes to body element
  useEffect(() => {
    document.body.setAttribute('data-theme', config.theme);
    document.body.setAttribute('data-mode', config.isDarkMode ? 'dark' : 'light');
  }, [config.theme, config.isDarkMode]);

  const handleDatasetLoaded = (newDataset: Dataset) => {
    setDataset(newDataset);
    
    const { dateKey, revenueKey, expenseKey, categoryKey } = newDataset.columnMapping;
    
    // 1. Setup default widgets
    const initialWidgets: any[] = [];
    
    if (revenueKey) {
      initialWidgets.push({
        id: 'widget-revenue-trend',
        title: 'Monthly Recurring Revenue Trend',
        type: 'area',
        xKey: dateKey || newDataset.headers[0],
        yKey: revenueKey,
      });
    }

    if (expenseKey) {
      initialWidgets.push({
        id: 'widget-expense-trend',
        title: 'Expense Run-rate Analysis',
        type: 'bar',
        xKey: dateKey || newDataset.headers[0],
        yKey: expenseKey,
      });
    }

    if (categoryKey && expenseKey) {
      initialWidgets.push({
        id: 'widget-expense-distribution',
        title: 'Cost Contribution by Category',
        type: 'pie',
        xKey: categoryKey,
        yKey: expenseKey,
      });
    }

    // Fallback if keys are missing
    if (initialWidgets.length === 0 && newDataset.headers.length > 1) {
      initialWidgets.push({
        id: 'widget-fallback',
        title: `Metric Breakdown (${newDataset.headers[1]})`,
        type: 'line',
        xKey: newDataset.headers[0],
        yKey: newDataset.headers[1],
      });
    }

    setConfig(prev => ({
      ...prev,
      widgets: initialWidgets
    }));

    // 2. Setup default alert rules based on average expenses/revenue
    let totalExpenses = 0;
    newDataset.data.forEach(row => {
      totalExpenses += parseNumber(row[expenseKey]);
    });
    const avgExpense = newDataset.data.length > 0 ? totalExpenses / newDataset.data.length : 5000;

    const initialRules: TriggerRule[] = [];

    if (expenseKey) {
      initialRules.push({
        id: 'rule-high-expenses',
        name: 'High Expenses Warning',
        column: expenseKey,
        condition: 'gt',
        threshold: Math.round(avgExpense * 1.2), // Alert if 20% higher than average
        severity: 'warning'
      });
    }

    if (revenueKey) {
      initialRules.push({
        id: 'rule-negative-growth',
        name: 'Revenue Contraction Risk',
        column: revenueKey,
        condition: 'neg-growth',
        threshold: 2, // Alert if drops by more than 2% month-over-month
        severity: 'critical'
      });
    }

    setRules(initialRules);
  };

  const handleResetDataset = () => {
    setDataset(null);
    setRules([]);
    setTriggeredAlerts([]);
  };

  const handleThemeToggle = () => {
    if (config.theme === 'midnight') return; // midnight theme is always dark
    setConfig(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  };

  return (
    <div className={`app-wrapper ${dataset ? 'layout-dashboard' : ''}`}>
      
      {/* Top Banner Navigation Header */}
      <header className="app-header animate-fade-in" style={{ width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center' }}>
            <BarChart3 size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-title)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              FinVibe <span style={{ fontSize: '0.65rem', fontWeight: 500, padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>Beta</span>
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {dataset && (
            <button
              onClick={handleResetDataset}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}
            >
              <RefreshCw size={14} /> Load Different Data
            </button>
          )}

          {config.theme !== 'midnight' && (
            <button
              onClick={handleThemeToggle}
              className="btn btn-secondary btn-icon"
              style={{ border: '1px solid var(--border-color)', padding: '0.5rem' }}
              title={config.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {config.isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="main-content" style={{ marginTop: 'calc(var(--header-height) + 1rem)', width: '100%' }}>
        {!dataset ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, minHeight: '80vh' }}>
            <DatasetUploader onDatasetLoaded={handleDatasetLoaded} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>
            
            {/* Dashboard Display Area */}
            <div style={{ minWidth: 0 }}>
              <DashboardGrid
                config={config}
                dataset={dataset}
                rules={rules}
                onRulesChange={setRules}
                triggeredAlerts={triggeredAlerts}
                onTriggeredAlertsChange={setTriggeredAlerts}
              />
            </div>

            {/* Custom Settings Configurator Pane */}
            <div style={{ position: 'sticky', top: 'calc(var(--header-height) + 2rem)' }}>
              <Configurator
                config={config}
                onChangeConfig={setConfig}
                dataset={dataset}
              />
            </div>

          </div>
        )}
      </main>

    </div>
  );
}

export default App;
