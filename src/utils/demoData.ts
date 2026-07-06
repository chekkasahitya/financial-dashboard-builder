import type { ColumnMapping } from '../types';

export interface DemoDataset {
  id: string;
  name: string;
  description: string;
  csv: string;
  defaultMapping: ColumnMapping;
}

export const DEMO_DATASETS: DemoDataset[] = [
  {
    id: 'saas-metrics',
    name: 'SaaS Monthly Financials (2025-2026)',
    description: 'Monthly SaaS recurring revenue (MRR), payroll, ad-spend, server costs, and customer success costs across regions.',
    defaultMapping: {
      dateKey: 'Date',
      revenueKey: 'MRR',
      expenseKey: 'Total_Expenses',
      categoryKey: 'Primary_Growth_Driver',
    },
    csv: `Date,MRR,Ad_Spend,Payroll,Hosting_Cost,Total_Expenses,Primary_Growth_Driver,Active_Customers,Churn_Rate_Percent
2025-01-31,12000,2500,6000,800,9300,Paid Ads,150,2.1
2025-02-28,13500,2800,6000,850,9650,Referrals,168,1.9
2025-03-31,15200,3200,6500,900,10600,Paid Ads,190,2.4
2025-04-30,17000,3500,6500,950,10950,SEO,212,1.8
2025-05-31,19200,4000,6500,1000,11500,Referrals,240,1.5
2025-06-30,22000,5000,7200,1100,13300,Paid Ads,275,2.0
2025-07-31,24800,5200,7200,1200,13600,SEO,310,2.2
2025-08-31,23500,5500,7200,1200,13900,Organic,294,4.5
2025-09-30,26900,6000,8000,1300,15300,SEO,336,1.7
2025-10-31,31000,7000,8000,1400,16400,Paid Ads,388,1.6
2025-11-30,35400,7500,8000,1500,17000,Referrals,442,1.3
2025-12-31,42000,9000,9500,1800,20300,Holiday Ads,525,1.2
2026-01-31,44500,8000,9500,1800,19300,SEO,556,1.8
2026-02-28,48200,8500,9500,1900,19900,Referrals,602,1.5
2026-03-31,52100,9000,11000,2000,22000,SEO,651,1.7
2026-04-30,57000,9500,11000,2100,22600,Paid Ads,712,1.4
2026-05-31,61500,10000,11000,2200,23200,Organic,768,1.6
2026-06-30,59800,12000,11000,2300,25300,Paid Ads,747,3.2
`
  },
  {
    id: 'ecommerce-retail',
    name: 'E-commerce Retail Performance',
    description: 'Weekly sales, shipping fees, cost of goods sold (COGS), marketing costs, refund rates, and product category trends.',
    defaultMapping: {
      dateKey: 'Week_Ending',
      revenueKey: 'Gross_Sales',
      expenseKey: 'Total_Costs',
      categoryKey: 'Top_Category',
    },
    csv: `Week_Ending,Gross_Sales,COGS,Marketing,Shipping_Fees,Total_Costs,Refund_Amount,Top_Category,Orders
2025-10-05,15400,6160,2200,1100,9460,340,Electronics,410
2025-10-12,16800,6720,2500,1200,10420,410,Electronics,445
2025-10-19,14200,5680,2400,1050,9130,280,Apparel,380
2025-10-26,18900,7560,2800,1400,11760,520,Home & Living,502
2025-11-02,21000,8400,3200,1600,13200,450,Electronics,560
2025-11-09,24500,9800,3500,1850,15150,680,Apparel,650
2025-11-16,28000,11200,4000,2100,17300,720,Electronics,740
2025-11-23,38000,15200,6500,2850,24550,1100,Home & Living,1020
2025-11-30,54000,21600,9000,4050,34650,1650,Electronics,1440
2025-12-07,49000,19600,8000,3680,31280,1800,Apparel,1310
2025-12-14,46000,18400,7500,3450,29350,1400,Home & Living,1230
2025-12-21,51000,20400,8500,3800,32700,1200,Electronics,1360
2025-12-28,32000,12800,4500,2400,19700,980,Apparel,850
2026-01-04,18000,7200,3000,1350,11550,420,Electronics,480
2026-01-11,19500,7800,3200,1460,12460,390,Electronics,520
2026-01-18,21200,8480,3400,1590,13470,410,Apparel,565
2026-01-25,20800,8320,3500,1560,13380,480,Home & Living,550
`
  }
];
