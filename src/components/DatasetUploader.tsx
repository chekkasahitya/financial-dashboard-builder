import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, Database, CheckCircle, AlertCircle, ArrowRight, BarChart2, Shield, Palette } from 'lucide-react';
import type { Dataset, ColumnMapping } from '../types';
import { DEMO_DATASETS } from '../utils/demoData';

interface DatasetUploaderProps {
  onDatasetLoaded: (dataset: Dataset) => void;
}

export const DatasetUploader: React.FC<DatasetUploaderProps> = ({ onDatasetLoaded }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedRaw, setParsedRaw] = useState<{ headers: string[]; data: any[]; fileName: string } | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({
    dateKey: '',
    revenueKey: '',
    expenseKey: '',
    categoryKey: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension !== 'csv' && extension !== 'json') {
      setError('Only CSV or JSON files are supported.');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setError('Empty file loaded.');
        return;
      }

      if (extension === 'csv') {
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0 && results.data.length === 0) {
              setError('Failed to parse CSV. Make sure it is formatted correctly.');
              return;
            }
            const headers = results.meta.fields || [];
            initializeMapping(headers, results.data, file.name);
          },
          error: (err: any) => {
            setError(`CSV Parsing Error: ${err.message}`);
          }
        });
      } else if (extension === 'json') {
        try {
          const parsed = JSON.parse(text);
          let dataArray: any[] = [];
          
          if (Array.isArray(parsed)) {
            dataArray = parsed;
          } else if (parsed && typeof parsed === 'object') {
            const keyWithArray = Object.keys(parsed).find(key => Array.isArray(parsed[key]));
            if (keyWithArray) {
              dataArray = parsed[keyWithArray];
            } else {
              dataArray = [parsed];
            }
          }

          if (dataArray.length === 0) {
            setError('JSON must contain an array of data rows.');
            return;
          }

          const headers = Object.keys(dataArray[0]);
          initializeMapping(headers, dataArray, file.name);
        } catch (err: any) {
          setError(`Invalid JSON: ${err.message}`);
        }
      }
    };

    reader.onerror = () => {
      setError('Error reading file.');
    };

    reader.readAsText(file);
  };

  const autoDetectColumns = (headers: string[]): ColumnMapping => {
    const detect = (keywords: string[]): string => {
      const match = headers.find(h => 
        keywords.some(keyword => h.toLowerCase().includes(keyword))
      );
      return match || '';
    };

    const dateKey = detect(['date', 'time', 'month', 'week', 'day', 'timestamp', 'period']);
    const revenueKey = detect(['mrr', 'revenue', 'sales', 'income', 'earning', 'invoice', 'gross']);
    const expenseKey = detect(['expense', 'cost', 'spend', 'payroll', 'outflow', 'fee', 'charge']);
    const categoryKey = detect(['category', 'segment', 'type', 'group', 'driver', 'channel', 'region']);

    return {
      dateKey: dateKey || headers[0] || '',
      revenueKey: revenueKey || headers[1] || '',
      expenseKey: expenseKey || headers[2] || '',
      categoryKey: categoryKey || headers[3] || '',
    };
  };

  const initializeMapping = (headers: string[], data: any[], fileName: string) => {
    setParsedRaw({ headers, data, fileName });
    const detected = autoDetectColumns(headers);
    setMapping(detected);
  };

  const handleDemoSelect = (demoId: string) => {
    const demo = DEMO_DATASETS.find(d => d.id === demoId);
    if (!demo) return;
    
    Papa.parse(demo.csv, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        onDatasetLoaded({
          fileName: demo.name,
          headers: results.meta.fields || [],
          data: results.data as any[],
          columnMapping: demo.defaultMapping
        });
      }
    });
  };

  const handleConfirmMapping = () => {
    if (!parsedRaw) return;
    onDatasetLoaded({
      fileName: parsedRaw.fileName,
      headers: parsedRaw.headers,
      data: parsedRaw.data,
      columnMapping: mapping
    });
  };

  return (
    <div className="mesh-container animate-fade-in" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Background Decorative Mesh Gradients */}
      <div className="mesh-bg-1"></div>
      <div className="mesh-bg-2"></div>

      {!parsedRaw ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* Landing Badge */}
          <div className="landing-badge">
            <Shield size={12} /> Live Data Analytics Protocol
          </div>

          {/* Landing Hero Headers */}
          <h1 className="landing-title">
            Turn raw datasets into <span className="gradient-text-color">financial intelligence</span>
          </h1>
          <p className="landing-sub">
            Instantly transform standard spreadsheet logs into customizable dashboard layouts. Map values to compute Net Margin, periodic compound growth, cash runway forecasts, and define real-time triggers.
          </p>

          {/* Three Column Mini Features Grid */}
          <div className="feature-intro-grid">
            <div className="mini-feature-card">
              <div className="mini-feature-icon">
                <BarChart2 size={16} />
              </div>
              <div>
                <h4 className="mini-feature-title">Tailored Visualizations</h4>
                <p className="mini-feature-text">Dynamic charts rendering multiple styles, color schemes, and layout templates on demand.</p>
              </div>
            </div>

            <div className="mini-feature-card">
              <div className="mini-feature-icon">
                <Shield size={16} />
              </div>
              <div>
                <h4 className="mini-feature-title">Automated Triggers</h4>
                <p className="mini-feature-text">Establish numerical threshold rules to audit anomalies, cash drain, or contraction points.</p>
              </div>
            </div>

            <div className="mini-feature-card">
              <div className="mini-feature-icon">
                <Palette size={16} />
              </div>
              <div>
                <h4 className="mini-feature-title">Financial Standing Reports</h4>
                <p className="mini-feature-text">Automated qualitative summaries, margins metrics, and burn forecasts computed instantly.</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem', width: '100%', alignItems: 'stretch' }}>
            
            {/* Drag & Drop Glass Upload Area */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2.5rem' }}>
              <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', fontWeight: 700 }}>Import Data Source</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Load local transaction files to compile a customized dashboard.</p>
              </div>

              <div
                className={`drag-area`}
                style={{
                  border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragActive ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  accept=".csv,.json"
                  onChange={handleFileChange}
                />
                <Upload size={40} style={{ color: dragActive ? 'var(--primary)' : 'var(--text-muted)', marginBottom: '1rem', transition: 'color 0.2s' }} />
                <p style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>
                  Drag & drop spreadsheet here
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  Supports clean .csv or .json files
                </p>
                <button type="button" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.65rem 1rem' }}>
                  Browse Local Files
                </button>
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--status-critical)', backgroundColor: 'var(--status-critical-bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Quick Demo Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
                <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', fontWeight: 700 }}>Demo Models</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Launch immediately using preconfigured mock ledgers.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, justifyContent: 'center' }}>
                  {DEMO_DATASETS.map((demo) => (
                    <div
                      key={demo.id}
                      onClick={() => handleDemoSelect(demo.id)}
                      className="demo-template-card"
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="demo-card-tag">Template Model</span>
                          <Database size={14} style={{ color: 'var(--primary)' }} />
                        </div>
                        <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.25rem', marginTop: '0.25rem' }}>
                          {demo.name}
                        </h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                          {demo.description}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '1rem', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                        Load Preview <ArrowRight size={14} style={{ marginLeft: '0.25rem' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Column Mapping Section */
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <div style={{ padding: '0.5rem', background: 'var(--status-success-bg)', color: 'var(--status-success)', borderRadius: '50%' }}>
                <CheckCircle size={22} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1.25rem' }}>Data Loaded Successfully</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{parsedRaw.fileName} • {parsedRaw.data.length} entries parsed</p>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.4 }}>
              Define the financial mapping keys below. We auto-selected column headers based on our analysis heuristics, but feel free to fine-tune them:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Date / Time Column</label>
                <select
                  value={mapping.dateKey}
                  onChange={(e) => setMapping({ ...mapping, dateKey: e.target.value })}
                  className="form-select"
                >
                  <option value="">-- Select Column --</option>
                  {parsedRaw.headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Revenue / Income Column</label>
                <select
                  value={mapping.revenueKey}
                  onChange={(e) => setMapping({ ...mapping, revenueKey: e.target.value })}
                  className="form-select"
                >
                  <option value="">-- Select Column --</option>
                  {parsedRaw.headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Expenses / Costs Column</label>
                <select
                  value={mapping.expenseKey}
                  onChange={(e) => setMapping({ ...mapping, expenseKey: e.target.value })}
                  className="form-select"
                >
                  <option value="">-- Select Column --</option>
                  {parsedRaw.headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Group Category (Optional)</label>
                <select
                  value={mapping.categoryKey}
                  onChange={(e) => setMapping({ ...mapping, categoryKey: e.target.value })}
                  className="form-select"
                >
                  <option value="">-- Select Column --</option>
                  {parsedRaw.headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.75rem' }}
                onClick={() => setParsedRaw(null)}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 2, padding: '0.75rem', justifyContent: 'center' }}
                onClick={handleConfirmMapping}
              >
                Generate Custom Dashboard <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
