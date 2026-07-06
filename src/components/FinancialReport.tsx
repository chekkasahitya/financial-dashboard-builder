import React from 'react';
import type { Dataset, FinancialReportData } from '../types';
import { generateFinancialReport } from '../utils/financialEngine';
import { TrendingUp, TrendingDown, DollarSign, Percent, AlertCircle, ArrowUpRight, CheckCircle2, Info, Download } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface FinancialReportProps {
  dataset: Dataset;
}

export const FinancialReport: React.FC<FinancialReportProps> = ({ dataset }) => {
  const report: FinancialReportData = generateFinancialReport(dataset);

  const handleDownloadReport = () => {
    const rawFileName = dataset.fileName.replace(/\.[^/.]+$/, "");
    const dateFormatted = new Date().toLocaleString();

    let md = `# FinVibe Executive Financial Standpoint Report\n\n`;
    md += `**Dataset Source File:** ${dataset.fileName}\n\n`;
    md += `**Analysis Compiled On:** ${dateFormatted}\n\n`;
    md += `**Total Records Processed:** ${dataset.data.length} rows\n\n`;
    md += `---\n\n`;

    md += `## 📊 Financial KPI Scorecard\n\n`;
    md += `| Financial Indicator | Calculated Value | Definition / Calculation |\n`;
    md += `| :--- | :--- | :--- |\n`;
    md += `| **Total Period Revenue** | ${formatCurrency(report.totalRevenue)} | Cumulative sales inflow |\n`;
    md += `| **Total Operating Expenses** | ${formatCurrency(report.totalExpenses)} | Operating cost outflow |\n`;
    md += `| **Net Operating Profit** | ${formatCurrency(report.netProfit)} | Revenue minus Expenses |\n`;
    md += `| **Net Profit Margin** | ${report.profitMargin.toFixed(2)}% | Net Profit / Total Revenue |\n`;
    md += `| **Timeline Growth Rate** | ${report.growthRate >= 0 ? '+' : ''}${report.growthRate.toFixed(2)}% | First-to-last record variance |\n`;
    if (report.runwayMonths !== undefined) {
      md += `| **Assumed Capital Runway** | ${report.runwayMonths.toFixed(1)} Months | Reserve of $100k divided by period burn |\n`;
    }
    md += `\n\n`;

    md += `## 💡 AI Financial Commentary & Insights\n\n`;
    if (report.insights.length > 0) {
      report.insights.forEach((insight) => {
        const severityIndicator = insight.type.toUpperCase();
        md += `### [${severityIndicator}] ${insight.title}\n`;
        md += `${insight.text}\n\n`;
      });
    } else {
      md += `*No insights generated.*\n\n`;
    }

    md += `## 📉 Operating Expense Categories Breakdown\n\n`;
    if (report.topExpenseCategories.length > 0) {
      md += `| Expense Category | Cumulative Spend ($) | Contribution Share (%) |\n`;
      md += `| :--- | :--- | :--- |\n`;
      report.topExpenseCategories.forEach((cat) => {
        const share = report.totalExpenses > 0 ? (cat.value / report.totalExpenses) * 100 : 0;
        md += `| ${cat.category} | ${formatCurrency(cat.value)} | ${share.toFixed(1)}% |\n`;
      });
    } else {
      md += `*No expense categories found in column mappings.*\n`;
    }
    md += `\n\n`;

    md += `---\n`;
    md += `*Report auto-compiled by FinVibe automated dashboard compiler engines. Confirm details with certified accountants before making key investment/business actions.*\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FinVibe_Executive_Report_${rawFileName}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} style={{ color: 'var(--status-success)', marginTop: '0.1rem' }} />;
      case 'critical':
        return <AlertCircle size={18} style={{ color: 'var(--status-critical)', marginTop: '0.1rem' }} />;
      case 'warning':
        return <AlertCircle size={18} style={{ color: 'var(--status-warning)', marginTop: '0.1rem' }} />;
      case 'info':
      default:
        return <Info size={18} style={{ color: 'var(--status-info)', marginTop: '0.1rem' }} />;
    }
  };

  const getInsightClass = (type: string) => {
    switch (type) {
      case 'success': return 'var(--status-success-bg)';
      case 'critical': return 'var(--status-critical-bg)';
      case 'warning': return 'var(--status-warning-bg)';
      case 'info':
      default:
        return 'var(--status-info-bg)';
    }
  };

  const getInsightBorder = (type: string) => {
    switch (type) {
      case 'success': return 'var(--status-success)';
      case 'critical': return 'var(--status-critical)';
      case 'warning': return 'var(--status-warning)';
      case 'info':
      default:
        return 'var(--status-info)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
      
      {/* Report Actions Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Executive Analytical Report</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Generate and download a comprehensive markdown summary of this data model.</span>
        </div>
        <button
          onClick={handleDownloadReport}
          className="btn btn-primary"
          style={{ fontSize: '0.8rem', padding: '0.6rem 1rem' }}
        >
          <Download size={14} /> Export Executive Summary (.md)
        </button>
      </div>

      {/* Visual Mathematical Scorecards */}
      <div className="metric-grid">
        
        {/* Revenue */}
        <div className="glass-card metric-card">
          <div className="metric-header">
            <span>Total Revenue</span>
            <DollarSign size={16} style={{ color: 'var(--status-success)' }} />
          </div>
          <div className="metric-value">{formatCurrency(report.totalRevenue)}</div>
          <div className="metric-change" style={{ color: report.growthRate >= 0 ? 'var(--status-success)' : 'var(--status-critical)' }}>
            {report.growthRate >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{report.growthRate >= 0 ? '+' : ''}{report.growthRate.toFixed(1)}% Growth</span>
          </div>
        </div>

        {/* Expenses */}
        <div className="glass-card metric-card">
          <div className="metric-header">
            <span>Total Operating Expenses</span>
            <DollarSign size={16} style={{ color: 'var(--status-critical)' }} />
          </div>
          <div className="metric-value">{formatCurrency(report.totalExpenses)}</div>
          <div className="metric-change" style={{ color: 'var(--text-muted)' }}>
            <span>Avg: {formatCurrency(report.averageExpense)} / period</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="glass-card metric-card">
          <div className="metric-header">
            <span>Net Operating Profit</span>
            <ArrowUpRight size={16} style={{ color: report.netProfit >= 0 ? 'var(--status-success)' : 'var(--status-critical)' }} />
          </div>
          <div className="metric-value" style={{ color: report.netProfit < 0 ? 'var(--status-critical)' : 'inherit' }}>
            {formatCurrency(report.netProfit)}
          </div>
          <div className="metric-change" style={{ color: report.netProfit >= 0 ? 'var(--status-success)' : 'var(--status-critical)' }}>
            <span>{report.netProfit >= 0 ? 'Net Surplus' : 'Net Loss'}</span>
          </div>
        </div>

        {/* Operating Margin */}
        <div className="glass-card metric-card">
          <div className="metric-header">
            <span>Net Profit Margin</span>
            <Percent size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="metric-value">{report.profitMargin.toFixed(1)}%</div>
          <div className="metric-change">
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
              (Revenue - Cost) / Revenue
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
        
        {/* AI Financial Commentary */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontWeight: 600 }}>
            Financial Health Commentary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            {report.insights.map((insight, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: getInsightClass(insight.type),
                  borderLeft: `4px solid ${getInsightBorder(insight.type)}`
                }}
              >
                {getInsightIcon(insight.type)}
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.15rem', color: 'var(--text-main)' }}>{insight.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.4 }}>{insight.text}</p>
                </div>
              </div>
            ))}

            {report.insights.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No insights could be generated. Map columns to load analytical heuristics.
              </div>
            )}
          </div>
        </div>

        {/* Expense Categories Breakdown */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontWeight: 600 }}>
            Cost Breakdown
          </h3>
          
          {report.topExpenseCategories.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No category mappings available.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
              {/* Recharts Mini Category Bar Chart */}
              <div style={{ height: '140px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.topExpenseCategories.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="category" width={80} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]}>
                      {report.topExpenseCategories.map((_, index) => (
                        <Cell key={`cell-${index}`} fillOpacity={0.8 - index * 0.15} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', maxHeight: '180px' }}>
                {report.topExpenseCategories.map((cat, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      padding: '0.5rem 0.75rem',
                      borderBottom: '1px solid var(--border-color)'
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{cat.category}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatCurrency(cat.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
