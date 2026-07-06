import type { Dataset, FinancialReportData, FinancialInsight } from '../types';

// Helper to parse string values containing symbols like $, commas, and spaces into clean floats
export const parseNumber = (val: any): number => {
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : val;
  }
  if (!val) return 0;
  
  // Strip non-numeric characters except decimal points and negative signs
  const cleaned = String(val).replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const generateFinancialReport = (dataset: Dataset): FinancialReportData => {
  const { data, columnMapping } = dataset;
  const { revenueKey, expenseKey, dateKey, categoryKey } = columnMapping;

  if (!data || data.length === 0) {
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      profitMargin: 0,
      averageRevenue: 0,
      averageExpense: 0,
      growthRate: 0,
      insights: [],
      topExpenseCategories: []
    };
  }

  // Calculate totals
  let totalRevenue = 0;
  let totalExpenses = 0;

  data.forEach(row => {
    totalRevenue += parseNumber(row[revenueKey]);
    totalExpenses += parseNumber(row[expenseKey]);
  });

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const averageRevenue = totalRevenue / data.length;
  const averageExpense = totalExpenses / data.length;

  // Calculate growth rate over the period based on chronological order of Date
  let growthRate = 0;
  const sortedData = [...data].sort((a, b) => {
    const dateA = a[dateKey] ? new Date(a[dateKey]).getTime() : 0;
    const dateB = b[dateKey] ? new Date(b[dateKey]).getTime() : 0;
    return dateA - dateB;
  });

  if (sortedData.length > 1) {
    const firstRow = sortedData[0];
    const lastRow = sortedData[sortedData.length - 1];
    const firstRevenue = parseNumber(firstRow[revenueKey]);
    const lastRevenue = parseNumber(lastRow[revenueKey]);

    if (firstRevenue > 0) {
      growthRate = ((lastRevenue - firstRevenue) / firstRevenue) * 100;
    } else if (lastRevenue > 0) {
      growthRate = 100; // Arbitrary jump from 0
    }
  }

  // Calculate top expense categories
  const categoryMap: Record<string, number> = {};
  data.forEach(row => {
    const cat = row[categoryKey] || 'Uncategorized';
    const exp = parseNumber(row[expenseKey]);
    categoryMap[cat] = (categoryMap[cat] || 0) + exp;
  });

  const topExpenseCategories = Object.entries(categoryMap)
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);

  // Runway calculation (if netProfit is negative, assume a baseline capital reserve of $100k or 6x monthly cost)
  let runwayMonths: number | undefined = undefined;
  const periodicDeficit = totalExpenses - totalRevenue;
  if (periodicDeficit > 0) {
    const averagePeriodBurn = periodicDeficit / data.length;
    if (averagePeriodBurn > 0) {
      const assumedReserve = Math.max(100000, averageExpense * 6);
      runwayMonths = assumedReserve / averagePeriodBurn;
    }
  }

  // Generate automated financial insights
  const insights: FinancialInsight[] = [];

  // Insight 1: Net Profit Margin Health
  if (profitMargin > 25) {
    insights.push({
      type: 'success',
      title: 'Excellent Operating Margin',
      text: `Your net profit margin is ${profitMargin.toFixed(1)}%. This shows highly efficient operations and strong pricing power, well above standard SaaS benchmarks.`
    });
  } else if (profitMargin > 10) {
    insights.push({
      type: 'success',
      title: 'Healthy Profitability',
      text: `Your net margin stands at ${profitMargin.toFixed(1)}%. Your revenue comfortably covers operating expenses, leaving room for scaling.`
    });
  } else if (profitMargin >= 0) {
    insights.push({
      type: 'info',
      title: 'Narrow Profitability',
      text: `Your profit margin is thin at ${profitMargin.toFixed(1)}% (Net Profit: $${netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}). Consider auditing operational expenses or adjusting pricing plans.`
    });
  } else {
    insights.push({
      type: 'critical',
      title: 'Operating At A Deficit',
      text: `You are operating at a net loss of $${Math.abs(netProfit).toLocaleString(undefined, { maximumFractionDigits: 0 })} (${profitMargin.toFixed(1)}% margin). Expenses are outpacing revenue.`
    });
  }

  // Insight 2: Revenue Growth
  if (growthRate > 15) {
    insights.push({
      type: 'success',
      title: 'Accelerating Revenue Growth',
      text: `Revenue expanded by ${growthRate.toFixed(1)}% over the analyzed timeline. This indicates strong market demand and customer acquisition velocity.`
    });
  } else if (growthRate > 0) {
    insights.push({
      type: 'info',
      title: 'Stable Revenue Growth',
      text: `Revenue increased by a moderate ${growthRate.toFixed(1)}% over the period, showing slow but positive upward progression.`
    });
  } else if (growthRate < -5) {
    insights.push({
      type: 'critical',
      title: 'Revenue Contraction Detected',
      text: `Revenue declined by ${Math.abs(growthRate).toFixed(1)}% from the start of the period to the end. Audit churn rates and client retention immediately.`
    });
  } else {
    insights.push({
      type: 'warning',
      title: 'Flat Revenue Growth',
      text: `Revenue growth is flat (${growthRate.toFixed(1)}%). Consider launching new campaigns or products to stimulate customer acquisition.`
    });
  }

  // Insight 3: Cost Efficiency and Top Category
  if (topExpenseCategories.length > 0) {
    const primaryCost = topExpenseCategories[0];
    const costPercentage = totalExpenses > 0 ? (primaryCost.value / totalExpenses) * 100 : 0;
    
    if (costPercentage > 40) {
      insights.push({
        type: 'warning',
        title: 'High Spending Concentration',
        text: `"${primaryCost.category}" constitutes ${costPercentage.toFixed(1)}% of your total costs ($${primaryCost.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}). Any increase here could drastically affect margins.`
      });
    } else {
      insights.push({
        type: 'info',
        title: 'Balanced Cost Structure',
        text: `Your largest cost category is "${primaryCost.category}", accounting for ${costPercentage.toFixed(1)}% of total outflows. This is a standard and healthy distribution.`
      });
    }
  }

  // Insight 4: Runway details
  if (runwayMonths !== undefined) {
    insights.push({
      type: 'critical',
      title: 'Runway Warning',
      text: `Based on your average burn rate of $${(periodicDeficit / data.length).toLocaleString(undefined, { maximumFractionDigits: 0 })} per period, a cash buffer of $100,000 would sustain operations for only ${runwayMonths.toFixed(1)} months. Cost cutting or fundraising is advised.`
    });
  }

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    averageRevenue,
    averageExpense,
    growthRate,
    runwayMonths,
    insights,
    topExpenseCategories
  };
};
