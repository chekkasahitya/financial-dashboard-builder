import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadialBarChart,
  RadialBar
} from 'recharts';
import type { ChartType, Dataset, Theme } from '../types';
import { parseNumber } from '../utils/financialEngine';

interface ChartRendererProps {
  type: ChartType;
  dataset: Dataset;
  xKey: string;
  yKey: string;
  theme: Theme;
  isDarkMode: boolean;
  colorOverride?: string;
}

// Function to resolve visual colors based on current dashboard theme
const getThemeColors = (theme: Theme, isDarkMode: boolean) => {
  switch (theme) {
    case 'sapphire':
      return {
        primary: isDarkMode ? '#60a5fa' : '#2563eb',
        secondary: isDarkMode ? '#38bdf8' : '#06b6d4',
        colors: isDarkMode ? ['#60a5fa', '#38bdf8', '#818cf8', '#34d399', '#f472b6'] : ['#2563eb', '#06b6d4', '#4f46e5', '#10b981', '#db2777']
      };
    case 'emerald':
      return {
        primary: isDarkMode ? '#34d399' : '#10b981',
        secondary: isDarkMode ? '#4ade80' : '#22c55e',
        colors: isDarkMode ? ['#34d399', '#4ade80', '#a3e635', '#2dd4bf', '#60a5fa'] : ['#10b981', '#22c55e', '#84cc16', '#0d9488', '#2563eb']
      };
    case 'sunset':
      return {
        primary: isDarkMode ? '#f87171' : '#ea580c',
        secondary: isDarkMode ? '#fbbf24' : '#eab308',
        colors: isDarkMode ? ['#f87171', '#fbbf24', '#f97316', '#f43f5e', '#a855f7'] : ['#ea580c', '#eab308', '#f97316', '#e11d48', '#7c3aed']
      };
    case 'midnight':
      return {
        primary: '#a855f7',
        secondary: '#06b6d4',
        colors: ['#a855f7', '#06b6d4', '#6366f1', '#ec4899', '#3b82f6']
      };
    case 'monochrome':
      return {
        primary: isDarkMode ? '#e2e8f0' : '#0f172a',
        secondary: isDarkMode ? '#94a3b8' : '#475569',
        colors: isDarkMode ? ['#f8fafc', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b'] : ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8']
      };
    default:
      return {
        primary: '#2563eb',
        secondary: '#06b6d4',
        colors: ['#2563eb', '#06b6d4', '#4f46e5', '#10b981']
      };
  }
};

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  type,
  dataset,
  xKey,
  yKey,
  theme,
  isDarkMode,
  colorOverride
}) => {
  const { data } = dataset;
  const themeColors = getThemeColors(theme, isDarkMode);
  
  const mainColor = colorOverride || themeColors.primary;
  const subColor = themeColors.secondary;

  // Format data for Recharts (ensuring the numeric Y-value is parsed cleanly)
  const chartData = data.map((row, idx) => ({
    ...row,
    [xKey]: row[xKey] || `Row ${idx + 1}`,
    [yKey]: parseNumber(row[yKey])
  }));

  // Recharts styling configs
  const gridStroke = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const labelColor = isDarkMode ? '#94a3b8' : '#64748b';
  const tooltipBg = isDarkMode ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDarkMode ? '#334155' : '#e2e8f0';
  const tooltipColor = isDarkMode ? '#f8fafc' : '#0f172a';

  const formatCurrency = (val: any) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: tooltipBg,
          border: `1px solid ${tooltipBorder}`,
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          color: tooltipColor,
          fontSize: '0.85rem'
        }}>
          <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} style={{ color: p.color || mainColor, display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
              <span>{p.name}:</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(p.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!chartData || chartData.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: labelColor }}>No chart data available.</div>;
  }

  if (type === 'metric') {
    // Single aggregate metric card
    const sum = chartData.reduce((acc, row) => acc + (row[yKey] as number), 0);
    const avg = chartData.length > 0 ? sum / chartData.length : 0;
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: labelColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          Aggregate Total ({yKey})
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-title)' }}>
          {formatCurrency(sum)}
        </div>
        <div style={{ fontSize: '0.8rem', color: labelColor, marginTop: '0.5rem' }}>
          Average: <span style={{ fontWeight: 600 }}>{formatCurrency(avg)}</span> per entry
        </div>
      </div>
    );
  }

  if (type === 'pie') {
    // Grouping by Category or XKey for Pie
    const pieGroups: Record<string, number> = {};
    chartData.forEach(row => {
      const name = String(row[xKey] || 'Uncategorized');
      pieGroups[name] = (pieGroups[name] || 0) + (row[yKey] as number);
    });

    const sortedEntries = Object.entries(pieGroups)
      .sort((a, b) => b[1] - a[1]);

    const topEntries = sortedEntries.slice(0, 5);
    const otherEntries = sortedEntries.slice(5);

    const pieData = topEntries.map(([name, value]) => ({ name, value }));
    if (otherEntries.length > 0) {
      const otherValue = otherEntries.reduce((sum, [_, val]) => sum + val, 0);
      pieData.push({ name: 'Other Group', value: otherValue });
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius="80%"
            fill={mainColor}
            dataKey="value"
            label={({ name, percent }) => {
              if (percent === undefined || percent < 0.05) return null; // Don't show labels for less than 5%
              return `${name} (${((percent || 0) * 100).toFixed(0)}%)`;
            }}
          >
            {pieData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={themeColors.colors[index % themeColors.colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '0.8rem', maxHeight: '55px', overflowY: 'auto' }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'composed') {
    const { revenueKey, expenseKey } = dataset.columnMapping;
    const secondaryKey = yKey === expenseKey ? revenueKey : expenseKey;
    const finalSecondaryKey = (secondaryKey && secondaryKey !== yKey)
      ? secondaryKey
      : dataset.headers.find(h => h !== xKey && h !== yKey) || yKey;

    const composedData = chartData.map(row => ({
      ...row,
      [finalSecondaryKey]: parseNumber(row[finalSecondaryKey])
    }));

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={composedData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey={xKey} tick={{ fill: labelColor, fontSize: 10 }} stroke={gridStroke} />
          <YAxis tick={{ fill: labelColor, fontSize: 10 }} tickFormatter={formatCurrency} stroke={gridStroke} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '0.8rem', maxHeight: '50px', overflowY: 'auto' }} />
          <Bar dataKey={yKey} name={yKey} fill={mainColor} radius={[4, 4, 0, 0]} barSize={25} />
          {finalSecondaryKey && finalSecondaryKey !== yKey && (
            <Line
              type="monotone"
              dataKey={finalSecondaryKey}
              name={finalSecondaryKey}
              stroke={subColor}
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'scatter') {
    const scatterData = chartData.map((row, idx) => {
      const rawX = row[xKey];
      const xVal = typeof rawX === 'number' ? rawX : parseFloat(String(rawX).replace(/[^\d.-]/g, ''));
      return {
        xVal: isNaN(xVal) ? idx + 1 : xVal,
        yVal: parseNumber(row[yKey]),
        labelName: String(rawX || `Entry ${idx + 1}`)
      };
    });

    const ScatterTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        return (
          <div style={{
            background: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            color: tooltipColor,
            fontSize: '0.85rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{dataPoint.labelName}</p>
            <p style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
              <span>X-Value ({xKey}):</span>
              <span style={{ fontWeight: 600 }}>{isNaN(Number(dataPoint.labelName)) ? dataPoint.xVal : formatCurrency(dataPoint.xVal)}</span>
            </p>
            <p style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', marginTop: '0.15rem' }}>
              <span>Y-Value ({yKey}):</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(dataPoint.yVal)}</span>
            </p>
          </div>
        );
      }
      return null;
    };

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis type="number" dataKey="xVal" name={xKey} tick={{ fill: labelColor, fontSize: 10 }} stroke={gridStroke} tickFormatter={(v) => String(v)} />
          <YAxis type="number" dataKey="yVal" name={yKey} tick={{ fill: labelColor, fontSize: 10 }} tickFormatter={formatCurrency} stroke={gridStroke} />
          <Tooltip content={<ScatterTooltip />} />
          <Legend wrapperStyle={{ fontSize: '0.8rem', maxHeight: '50px', overflowY: 'auto' }} />
          <Scatter name={`${yKey} vs ${xKey}`} data={scatterData} fill={mainColor} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'radar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke={gridStroke} />
          <PolarAngleAxis dataKey={xKey} tick={{ fill: labelColor, fontSize: 9 }} />
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: labelColor, fontSize: 8 }} />
          <Radar name={yKey} dataKey={yKey} stroke={mainColor} fill={mainColor} fillOpacity={0.4} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '0.8rem', maxHeight: '50px', overflowY: 'auto' }} />
        </RadarChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'radialBar') {
    // Grouping by Category or XKey for RadialBarChart
    const groups: Record<string, number> = {};
    chartData.forEach(row => {
      const name = String(row[xKey] || 'Uncategorized');
      groups[name] = (groups[name] || 0) + (row[yKey] as number);
    });

    const sorted = Object.entries(groups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // top 5

    const radialData = sorted.map(([name, value], index) => ({
      name,
      value,
      fill: themeColors.colors[index % themeColors.colors.length]
    }));

    return (
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="85%" barSize={10} data={radialData}>
          <RadialBar
            label={{ position: 'insideStart', fill: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: 8 }}
            background
            dataKey="value"
          />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '0.75rem', maxHeight: '180px', overflowY: 'auto' }} />
        </RadialBarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {type === 'line' ? (
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey={xKey} tick={{ fill: labelColor, fontSize: 10 }} stroke={gridStroke} />
          <YAxis tick={{ fill: labelColor, fontSize: 10 }} tickFormatter={formatCurrency} stroke={gridStroke} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '0.8rem', maxHeight: '50px', overflowY: 'auto' }} />
          <Line
            type="monotone"
            dataKey={yKey}
            name={yKey}
            stroke={mainColor}
            strokeWidth={3}
            activeDot={{ r: 8 }}
            dot={{ r: 4, strokeWidth: 1 }}
          />
        </LineChart>
      ) : type === 'area' ? (
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={mainColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={mainColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey={xKey} tick={{ fill: labelColor, fontSize: 10 }} stroke={gridStroke} />
          <YAxis tick={{ fill: labelColor, fontSize: 10 }} tickFormatter={formatCurrency} stroke={gridStroke} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '0.8rem', maxHeight: '50px', overflowY: 'auto' }} />
          <Area
            type="monotone"
            dataKey={yKey}
            name={yKey}
            stroke={mainColor}
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorArea)"
          />
        </AreaChart>
      ) : (
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey={xKey} tick={{ fill: labelColor, fontSize: 10 }} stroke={gridStroke} />
          <YAxis tick={{ fill: labelColor, fontSize: 10 }} tickFormatter={formatCurrency} stroke={gridStroke} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '0.8rem', maxHeight: '50px', overflowY: 'auto' }} />
          <Bar dataKey={yKey} name={yKey} fill={mainColor} radius={[4, 4, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? mainColor : subColor} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      )}
    </ResponsiveContainer>
  );
};
