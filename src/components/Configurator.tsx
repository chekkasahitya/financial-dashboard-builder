import React, { useState } from 'react';
import type { Theme, DashboardStyle, ChartType, DashboardConfig, WidgetConfig, Dataset } from '../types';
import { Settings, Plus, Trash2, LayoutGrid, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

interface ConfiguratorProps {
  config: DashboardConfig;
  onChangeConfig: (newConfig: DashboardConfig) => void;
  dataset: Dataset;
}

const THEME_OPTIONS: { id: Theme; name: string; description: string }[] = [
  { id: 'sapphire', name: 'Sapphire Ocean', description: 'Royal blues and teals' },
  { id: 'emerald', name: 'Emerald Wealth', description: 'Rich greens and mints' },
  { id: 'sunset', name: 'Sunset Coral', description: 'Vibrant oranges and reds' },
  { id: 'midnight', name: 'Midnight Neon', description: 'Purple and cyber cyan' },
  { id: 'monochrome', name: 'Charcoal Minimal', description: 'Clean slate and greys' },
];

const LAYOUT_OPTIONS: { id: DashboardStyle; name: string; icon: string }[] = [
  { id: 'grid', name: 'Dynamic Grid', icon: 'grid' },
  { id: 'sidebar', name: 'Navigation Sidebar', icon: 'sidebar' },
  { id: 'tabs', name: 'Categorized Tabs', icon: 'tabs' }
];

const CHART_TYPES: { id: ChartType; name: string }[] = [
  { id: 'line', name: 'Line Chart' },
  { id: 'bar', name: 'Bar Chart' },
  { id: 'area', name: 'Area Chart' },
  { id: 'pie', name: 'Pie Chart' },
  { id: 'composed', name: 'Composed (Bar + Line)' },
  { id: 'scatter', name: 'Scatter Correlation Plot' },
  { id: 'metric', name: 'Stat Aggregate Card' }
];

export const Configurator: React.FC<ConfiguratorProps> = ({ config, onChangeConfig, dataset }) => {
  const [activeTab, setActiveTab] = useState<'visuals' | 'widgets'>('visuals');
  
  const { theme, isDarkMode, style, widgets } = config;
  const { headers } = dataset;

  const handleUpdateTheme = (newTheme: Theme) => {
    onChangeConfig({
      ...config,
      theme: newTheme,
      // Midnight Neon is natively dark mode
      isDarkMode: newTheme === 'midnight' ? true : isDarkMode
    });
  };

  const handleToggleDarkMode = () => {
    onChangeConfig({
      ...config,
      isDarkMode: !isDarkMode
    });
  };

  const handleUpdateStyle = (newStyle: DashboardStyle) => {
    onChangeConfig({
      ...config,
      style: newStyle
    });
  };

  const handleAddWidget = () => {
    const newWidget: WidgetConfig = {
      id: `widget-${Date.now()}`,
      title: `Custom Metric Chart #${widgets.length + 1}`,
      type: 'line',
      xKey: dataset.columnMapping.dateKey || headers[0],
      yKey: dataset.columnMapping.revenueKey || headers[1],
    };
    onChangeConfig({
      ...config,
      widgets: [...widgets, newWidget]
    });
  };

  const handleDeleteWidget = (id: string) => {
    onChangeConfig({
      ...config,
      widgets: widgets.filter(w => w.id !== id)
    });
  };

  const handleUpdateWidget = (id: string, updates: Partial<WidgetConfig>) => {
    onChangeConfig({
      ...config,
      widgets: widgets.map(w => w.id === id ? { ...w, ...updates } : w)
    });
  };

  return (
    <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <Settings size={18} style={{ color: 'var(--primary)' }} />
        <h3 style={{ fontSize: '1.15rem' }}>Dashboard Settings</h3>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', backgroundColor: 'rgba(0,0,0,0.03)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
        <button
          onClick={() => setActiveTab('visuals')}
          className="btn"
          style={{
            flex: 1,
            padding: '0.5rem',
            fontSize: '0.8rem',
            background: activeTab === 'visuals' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'visuals' ? 'var(--text-main)' : 'var(--text-muted)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            boxShadow: activeTab === 'visuals' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          Theme & Style
        </button>
        <button
          onClick={() => setActiveTab('widgets')}
          className="btn"
          style={{
            flex: 1,
            padding: '0.5rem',
            fontSize: '0.8rem',
            background: activeTab === 'widgets' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'widgets' ? 'var(--text-main)' : 'var(--text-muted)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            boxShadow: activeTab === 'widgets' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          Widgets ({widgets.length})
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem' }}>
        {activeTab === 'visuals' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Dark Mode Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Dark Theme Mode</span>
              </div>
              <button
                onClick={handleToggleDarkMode}
                disabled={theme === 'midnight'}
                style={{ background: 'transparent', border: 'none', cursor: theme === 'midnight' ? 'not-allowed' : 'pointer', color: isDarkMode ? 'var(--primary)' : 'var(--text-muted)' }}
              >
                {isDarkMode ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
              </button>
            </div>

            {/* Layout Style Choice */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Dashboard Template Style
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {LAYOUT_OPTIONS.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => handleUpdateStyle(layout.id)}
                    className="btn"
                    style={{
                      justifyContent: 'flex-start',
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: style === layout.id ? 'var(--primary)' : 'transparent',
                      color: style === layout.id ? 'white' : 'var(--text-main)',
                      border: `1px solid ${style === layout.id ? 'var(--primary)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <LayoutGrid size={16} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{layout.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors Themes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Color Palette Theme
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {THEME_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleUpdateTheme(t.id)}
                    className="btn"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      width: '100%',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      background: theme === t.id ? 'rgba(var(--primary-rgb), 0.08)' : 'transparent',
                      border: `1px solid ${theme === t.id ? 'var(--primary)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-sm)',
                      height: 'auto'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: theme === t.id ? 'var(--primary)' : 'var(--text-main)' }}>{t.name}</span>
                      {theme === t.id && <Sparkles size={14} style={{ color: 'var(--primary)' }} />}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{t.description}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {widgets.map((widget, index) => (
              <div
                key={widget.id}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  backgroundColor: 'rgba(0,0,0,0.01)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Widget #{index + 1}</span>
                  <button
                    onClick={() => handleDeleteWidget(widget.id)}
                    className="btn btn-secondary btn-icon"
                    style={{ border: 'none', padding: '0.25rem', color: 'var(--status-critical)' }}
                    title="Remove Widget"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label style={{ marginBottom: '0.25rem' }}>Title</label>
                  <input
                    type="text"
                    value={widget.title}
                    onChange={(e) => handleUpdateWidget(widget.id, { title: e.target.value })}
                    className="form-input"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ marginBottom: '0.25rem' }}>Chart Type</label>
                    <select
                      value={widget.type}
                      onChange={(e) => handleUpdateWidget(widget.id, { type: e.target.value as ChartType })}
                      className="form-select"
                      style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                    >
                      {CHART_TYPES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ marginBottom: '0.25rem' }}>Y-Axis (Metrics)</label>
                    <select
                      value={widget.yKey}
                      onChange={(e) => handleUpdateWidget(widget.id, { yKey: e.target.value })}
                      className="form-select"
                      style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                    >
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>

                {widget.type !== 'metric' && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ marginBottom: '0.25rem' }}>X-Axis (Dimension)</label>
                    <select
                      value={widget.xKey}
                      onChange={(e) => handleUpdateWidget(widget.id, { xKey: e.target.value })}
                      className="form-select"
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={handleAddWidget}
              className="btn btn-secondary"
              style={{ width: '100%', borderStyle: 'dashed', borderWidth: '1.5px', justifyContent: 'center' }}
            >
              <Plus size={16} /> Add Custom Widget
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
