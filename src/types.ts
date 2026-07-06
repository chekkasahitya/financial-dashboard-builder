export type Theme = 'sapphire' | 'emerald' | 'sunset' | 'midnight' | 'monochrome';
export type DashboardStyle = 'grid' | 'sidebar' | 'tabs';
export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'metric' | 'composed' | 'scatter';

export interface ColumnMapping {
  dateKey: string;
  revenueKey: string;
  expenseKey: string;
  categoryKey: string;
}

export interface Dataset {
  fileName: string;
  headers: string[];
  data: Record<string, any>[];
  columnMapping: ColumnMapping;
}

export interface WidgetConfig {
  id: string;
  title: string;
  type: ChartType;
  xKey: string;
  yKey: string;
  color?: string; // Hex or theme-color overrides
}

export interface DashboardConfig {
  theme: Theme;
  isDarkMode: boolean;
  style: DashboardStyle;
  widgets: WidgetConfig[];
}

export type TriggerCondition = 'gt' | 'lt' | 'eq' | 'neg-growth';

export interface TriggerRule {
  id: string;
  name: string;
  column: string;
  condition: TriggerCondition;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
}

export interface TriggeredAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  value: number;
  rowIdx?: number;
  timestamp: string;
}

export interface FinancialInsight {
  type: 'success' | 'warning' | 'info' | 'critical';
  title: string;
  text: string;
}

export interface FinancialReportData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  averageRevenue: number;
  averageExpense: number;
  growthRate: number; // Month-over-Month or general trend percentage
  runwayMonths?: number;
  insights: FinancialInsight[];
  topExpenseCategories: { category: string; value: number }[];
}
