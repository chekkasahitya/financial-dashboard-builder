import React, { useState } from 'react';
import type { DashboardConfig, Dataset, TriggeredAlert, TriggerRule } from '../types';
import { ChartRenderer } from './ChartRenderer';
import { FinancialReport } from './FinancialReport';
import { TriggerManager } from './TriggerManager';
import { LayoutGrid, FileText, Bell, BarChart2, Calendar, Eye } from 'lucide-react';

interface DashboardGridProps {
  config: DashboardConfig;
  dataset: Dataset;
  rules: TriggerRule[];
  onRulesChange: (newRules: TriggerRule[]) => void;
  triggeredAlerts: TriggeredAlert[];
  onTriggeredAlertsChange: (alerts: TriggeredAlert[]) => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  config,
  dataset,
  rules,
  onRulesChange,
  triggeredAlerts,
  onTriggeredAlertsChange
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'triggers'>('overview');
  const [activeSidebarSelection, setActiveSidebarSelection] = useState<string>('overview');

  const { style, theme, isDarkMode, widgets } = config;
  const { fileName } = dataset;

  // Helpers to assign grid dimensions to widgets based on their chart type
  const getWidgetGridClass = (type: string) => {
    switch (type) {
      case 'metric':
        return 'col-4';
      case 'pie':
        return 'col-6';
      case 'line':
      case 'area':
      case 'bar':
      default:
        return 'col-6';
    }
  };

  const renderWidget = (widget: any) => (
    <div key={widget.id} className={`glass-card ${getWidgetGridClass(widget.type)}`} style={{ minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{widget.title}</h4>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Eye size={12} /> {widget.type.toUpperCase()}
        </span>
      </div>
      <div style={{ flex: 1, minHeight: '220px' }}>
        <ChartRenderer
          type={widget.type}
          dataset={dataset}
          xKey={widget.xKey}
          yKey={widget.yKey}
          theme={theme}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );

  /* ==========================================================================
     LAYOUT RENDERERS
     ========================================================================== */

  // 1. STYLE: STANDARD DYNAMIC GRID
  const renderGridLayout = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Financial Health Scorecards */}
      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} style={{ color: 'var(--primary)' }} />
          Financial Standpoint Summary
        </h3>
        <FinancialReport dataset={dataset} />
      </div>

      {/* Interactive Charts Grid */}
      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart2 size={18} style={{ color: 'var(--primary)' }} />
          Visual Metrics Dashboard
        </h3>
        
        {widgets.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No visual widgets configured. Use the settings panel on the right to add charts.
          </div>
        ) : (
          <div className="dashboard-grid-layout">
            {widgets.map(renderWidget)}
          </div>
        )}
      </div>

      {/* Alert Manager */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={18} style={{ color: 'var(--status-critical)' }} />
          Automated Alerts & Triggers
        </h3>
        <TriggerManager
          dataset={dataset}
          rules={rules}
          onRulesChange={onRulesChange}
          triggeredAlerts={triggeredAlerts}
          onTriggeredAlertsChange={onTriggeredAlertsChange}
        />
      </div>
    </div>
  );

  // 2. STYLE: TABBED INTERFACE
  const renderTabLayout = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Tab Selectors */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className="btn"
          style={{
            background: activeTab === 'overview' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'overview' ? 'white' : 'var(--text-main)',
            border: activeTab === 'overview' ? 'none' : '1px solid var(--border-color)'
          }}
        >
          <FileText size={16} /> Financial Standpoint
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className="btn"
          style={{
            background: activeTab === 'charts' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'charts' ? 'white' : 'var(--text-main)',
            border: activeTab === 'charts' ? 'none' : '1px solid var(--border-color)'
          }}
        >
          <BarChart2 size={16} /> Interactive Dashboard ({widgets.length})
        </button>
        <button
          onClick={() => setActiveTab('triggers')}
          className="btn"
          style={{
            background: activeTab === 'triggers' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'triggers' ? 'white' : 'var(--text-main)',
            border: activeTab === 'triggers' ? 'none' : '1px solid var(--border-color)',
            position: 'relative'
          }}
        >
          <Bell size={16} /> Automated Alerts
          {triggeredAlerts.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              backgroundColor: 'var(--status-critical)',
              color: 'white',
              fontSize: '10px',
              fontWeight: 700,
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}>
              {triggeredAlerts.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && <FinancialReport dataset={dataset} />}
        {activeTab === 'charts' && (
          widgets.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No visual widgets configured. Use the settings panel on the right to add charts.
            </div>
          ) : (
            <div className="dashboard-grid-layout">
              {widgets.map(renderWidget)}
            </div>
          )
        )}
        {activeTab === 'triggers' && (
          <TriggerManager
            dataset={dataset}
            rules={rules}
            onRulesChange={onRulesChange}
            triggeredAlerts={triggeredAlerts}
            onTriggeredAlertsChange={onTriggeredAlertsChange}
          />
        )}
      </div>
    </div>
  );

  // 3. STYLE: SIDEBAR NAVIGATION STYLE
  const renderSidebarLayout = () => {
    const isOverview = activeSidebarSelection === 'overview';
    const isReport = activeSidebarSelection === 'report';
    const isAlerts = activeSidebarSelection === 'alerts';
    
    // Check if sidebar selection matches a specific widget
    const selectedWidget = widgets.find(w => w.id === activeSidebarSelection);

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem' }}>
        
        {/* Inner layout sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRight: '1px solid var(--border-color)', paddingRight: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Views
          </span>
          <button
            onClick={() => setActiveSidebarSelection('overview')}
            className="btn"
            style={{
              justifyContent: 'flex-start',
              background: isOverview ? 'var(--primary)' : 'transparent',
              color: isOverview ? 'white' : 'var(--text-main)',
              border: 'none',
              padding: '0.65rem 0.85rem'
            }}
          >
            <LayoutGrid size={15} /> All Widgets
          </button>
          <button
            onClick={() => setActiveSidebarSelection('report')}
            className="btn"
            style={{
              justifyContent: 'flex-start',
              background: isReport ? 'var(--primary)' : 'transparent',
              color: isReport ? 'white' : 'var(--text-main)',
              border: 'none',
              padding: '0.65rem 0.85rem'
            }}
          >
            <FileText size={15} /> Financial Standpoint
          </button>
          <button
            onClick={() => setActiveSidebarSelection('alerts')}
            className="btn"
            style={{
              justifyContent: 'flex-start',
              background: isAlerts ? 'var(--primary)' : 'transparent',
              color: isAlerts ? 'white' : 'var(--text-main)',
              border: 'none',
              padding: '0.65rem 0.85rem'
            }}
          >
            <Bell size={15} /> Triggers & Alerts
          </button>

          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
            Widgets ({widgets.length})
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '200px', overflowY: 'auto' }}>
            {widgets.map(w => (
              <button
                key={w.id}
                onClick={() => setActiveSidebarSelection(w.id)}
                className="btn"
                style={{
                  justifyContent: 'flex-start',
                  background: activeSidebarSelection === w.id ? 'var(--primary)' : 'transparent',
                  color: activeSidebarSelection === w.id ? 'white' : 'var(--text-muted)',
                  border: 'none',
                  fontSize: '0.8rem',
                  padding: '0.5rem 0.75rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={w.title}
              >
                • {w.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content Pane */}
        <div className="animate-fade-in" style={{ minWidth: 0 }}>
          {isOverview && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="dashboard-grid-layout">
                {widgets.map(renderWidget)}
              </div>
              {widgets.length === 0 && (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No visual widgets configured. Use the settings panel on the right to add charts.
                </div>
              )}
            </div>
          )}
          
          {isReport && <FinancialReport dataset={dataset} />}
          
          {isAlerts && (
            <TriggerManager
              dataset={dataset}
              rules={rules}
              onRulesChange={onRulesChange}
              triggeredAlerts={triggeredAlerts}
              onTriggeredAlertsChange={onTriggeredAlertsChange}
            />
          )}

          {selectedWidget && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass-card" style={{ minHeight: '450px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  {selectedWidget.title}
                </h3>
                <div style={{ flex: 1 }}>
                  <ChartRenderer
                    type={selectedWidget.type}
                    dataset={dataset}
                    xKey={selectedWidget.xKey}
                    yKey={selectedWidget.yKey}
                    theme={theme}
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Summary Subheader bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-title)' }}>
            Dataset: <span style={{ color: 'var(--primary)' }}>{fileName}</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Dashboard compiled dynamically • {dataset.data.length} records parsed
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <Calendar size={14} />
          <span>Last modified: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Main Layout Area */}
      {style === 'grid' && renderGridLayout()}
      {style === 'tabs' && renderTabLayout()}
      {style === 'sidebar' && renderSidebarLayout()}
    </div>
  );
};
