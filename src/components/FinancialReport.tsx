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

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to download the PDF report.");
      return;
    }

    // Build the insights list HTML
    let insightsHtml = '';
    if (report.insights.length > 0) {
      report.insights.forEach((insight) => {
        const severityIndicator = insight.type.toUpperCase();
        insightsHtml += `
          <div class="insight-item insight-${insight.type}">
            <div class="insight-title">[${severityIndicator}] ${insight.title}</div>
            <div>${insight.text}</div>
          </div>
        `;
      });
    } else {
      insightsHtml = '<p style="color: #64748b; font-style: italic;">No insights generated.</p>';
    }

    // Build the expense categories table rows HTML
    let expensesRowsHtml = '';
    if (report.topExpenseCategories.length > 0) {
      report.topExpenseCategories.forEach((cat) => {
        const share = report.totalExpenses > 0 ? (cat.value / report.totalExpenses) * 100 : 0;
        expensesRowsHtml += `
          <tr>
            <td style="font-weight: 500;">${cat.category}</td>
            <td>${formatCurrency(cat.value)}</td>
            <td>${share.toFixed(1)}%</td>
          </tr>
        `;
      });
    } else {
      expensesRowsHtml = '<tr><td colspan="3" style="color: #64748b; font-style: italic;">No expense categories mapped.</td></tr>';
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>FinVibe Executive Report - ${rawFileName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            color: #0f172a;
            background: white;
            margin: 40px;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title-area h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 24px;
            margin: 0 0 5px 0;
            color: #1e3a8a;
          }
          .title-area p {
            font-size: 12px;
            color: #64748b;
            margin: 0;
          }
          .logo {
            font-family: 'Outfit', sans-serif;
            font-weight: 800;
            font-size: 20px;
            color: #2563eb;
          }
          .scorecard-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            background: #f8fafc;
          }
          .card-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            margin-bottom: 5px;
            font-weight: 600;
          }
          .card-value {
            font-family: 'Outfit', sans-serif;
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
          }
          .card-change {
            font-size: 11px;
            margin-top: 5px;
            font-weight: 500;
          }
          .insight-section {
            margin-bottom: 30px;
          }
          .section-title {
            font-family: 'Outfit', sans-serif;
            font-size: 15px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 6px;
            margin-bottom: 15px;
            color: #1e293b;
            font-weight: 600;
          }
          .insight-item {
            padding: 12px 15px;
            border-radius: 6px;
            margin-bottom: 12px;
            font-size: 12.5px;
            border-left: 4px solid #cbd5e1;
          }
          .insight-success { background: #ecfdf5; border-left-color: #10b981; color: #065f46; }
          .insight-warning { background: #fffbeb; border-left-color: #f59e0b; color: #92400e; }
          .insight-critical { background: #fef2f2; border-left-color: #ef4444; color: #991b1b; }
          .insight-info { background: #eff6ff; border-left-color: #3b82f6; color: #1e40af; }
          .insight-title {
            font-weight: 600;
            margin-bottom: 4px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 12.5px;
          }
          th, td {
            border-bottom: 1px solid #e2e8f0;
            padding: 10px 12px;
            text-align: left;
          }
          th {
            background: #f1f5f9;
            font-weight: 600;
            color: #475569;
          }
          .footer {
            margin-top: 50px;
            font-size: 10px;
            color: #94a3b8;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
          }
          @media print {
            body { margin: 20px; }
            .card { background: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .insight-item { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .insight-success { background: #ecfdf5 !important; }
            .insight-warning { background: #fffbeb !important; }
            .insight-critical { background: #fef2f2 !important; }
            .insight-info { background: #eff6ff !important; }
            th { background: #f1f5f9 !important; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title-area">
            <h1>Executive Financial Standpoint Report</h1>
            <p>Dataset: <strong>${dataset.fileName}</strong> &bull; Compiled on ${dateFormatted} &bull; ${dataset.data.length} entries</p>
          </div>
          <div class="logo">FinVibe Dashboard</div>
        </div>

        <div class="scorecard-grid">
          <div class="card">
            <div class="card-label">Total Revenue</div>
            <div class="card-value">${formatCurrency(report.totalRevenue)}</div>
            <div class="card-change" style="color: ${report.growthRate >= 0 ? '#10b981' : '#ef4444'}">
              ${report.growthRate >= 0 ? '▲' : '▼'} ${report.growthRate.toFixed(1)}% Growth
            </div>
          </div>
          <div class="card">
            <div class="card-label">Total Expenses</div>
            <div class="card-value">${formatCurrency(report.totalExpenses)}</div>
            <div class="card-change" style="color: #64748b">
              Avg: ${formatCurrency(report.averageExpense)} / period
            </div>
          </div>
          <div class="card">
            <div class="card-label">Net Operating Profit</div>
            <div class="card-value">${formatCurrency(report.netProfit)}</div>
            <div class="card-change" style="color: ${report.netProfit >= 0 ? '#10b981' : '#ef4444'}">
              ${report.netProfit >= 0 ? 'Net Surplus' : 'Net Deficit'}
            </div>
          </div>
          <div class="card">
            <div class="card-label">Net Profit Margin</div>
            <div class="card-value">${report.profitMargin.toFixed(1)}%</div>
            <div class="card-change" style="color: #64748b">
              Profitability Margin
            </div>
          </div>
        </div>

        <div class="insight-section">
          <div class="section-title">💡 Financial Standing Heuristics & Insights</div>
          ${insightsHtml}
        </div>

        <div class="insight-section">
          <div class="section-title">📊 Expense Category Distribution</div>
          <table>
            <thead>
              <tr>
                <th>Expense Category</th>
                <th>Cumulative Spend</th>
                <th>Contribution share %</th>
              </tr>
            </thead>
            <tbody>
              ${expensesRowsHtml}
            </tbody>
          </table>
        </div>

        <div class="footer">
          Report compiled by FinVibe Auto-Analytics. Confirmed data from source file ${dataset.fileName}.
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Executive PDF Report</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Generate and compile a printable PDF summary outlining KPIs and financial standings.</span>
        </div>
        <button
          onClick={handleDownloadReport}
          className="btn btn-primary"
          style={{ fontSize: '0.8rem', padding: '0.6rem 1rem' }}
        >
          <Download size={14} /> Download Executive Report (.pdf)
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
