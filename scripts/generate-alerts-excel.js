const XLSX = require('xlsx');

// All the alerts to create
const alerts = [
  // Platform alerts
  { category: 'Platform', query: '"Apex Service Partners" acquires' },
  { category: 'Platform', query: '"Apex Service Partners" acquisition' },
  { category: 'Platform', query: '"Sila Services" acquires' },
  { category: 'Platform', query: '"Sila Services" acquisition' },
  { category: 'Platform', query: '"Redwood Services" acquires' },
  { category: 'Platform', query: '"Redwood Services" acquisition' },
  { category: 'Platform', query: '"SEER Group" acquires' },
  { category: 'Platform', query: '"SEER Group" acquisition' },
  { category: 'Platform', query: '"Heartland Home Services" acquires' },
  { category: 'Platform', query: '"Heartland Home Services" acquisition' },
  { category: 'Platform', query: '"Exigent Group" acquires' },
  { category: 'Platform', query: '"Exigent Group" acquisition' },
  { category: 'Platform', query: '"Orion Group" HVAC acquires' },
  { category: 'Platform', query: '"Orion Group" HVAC acquisition' },
  { category: 'Platform', query: '"Wrench Group" acquires' },
  { category: 'Platform', query: '"Wrench Group" acquisition' },
  { category: 'Platform', query: '"Any Hour Group" acquires' },
  { category: 'Platform', query: '"Any Hour Group" acquisition' },
  { category: 'Platform', query: '"Bestige" HVAC acquires' },
  { category: 'Platform', query: '"Bestige" HVAC acquisition' },
  { category: 'Platform', query: '"Frontier Service Partners" acquires' },
  { category: 'Platform', query: '"Frontier Service Partners" acquisition' },
  { category: 'Platform', query: '"Frank Gay Services" acquires' },
  { category: 'Platform', query: '"Frank Gay Services" acquisition' },
  { category: 'Platform', query: '"Morris-Jenkins" acquires' },
  { category: 'Platform', query: '"Morris-Jenkins" acquisition' },
  { category: 'Platform', query: '"Horizon Services" acquires' },
  { category: 'Platform', query: '"Horizon Services" acquisition' },
  { category: 'Platform', query: '"Coolray" HVAC acquires' },
  { category: 'Platform', query: '"Coolray" HVAC acquisition' },
  { category: 'Platform', query: '"Parker & Sons" acquires' },
  { category: 'Platform', query: '"Parker & Sons" acquisition' },
  { category: 'Platform', query: '"HomeBreeze" acquires' },
  { category: 'Platform', query: '"HomeBreeze" acquisition' },
  { category: 'Platform', query: '"Reedy Industries" acquires' },
  { category: 'Platform', query: '"Reedy Industries" acquisition' },
  { category: 'Platform', query: '"Radiant Plumbing" acquires' },
  { category: 'Platform', query: '"Radiant Plumbing" acquisition' },

  // PE Firm alerts
  { category: 'PE Firm', query: '"Alpine Investors" HVAC' },
  { category: 'PE Firm', query: '"Alpine Investors" home services acquisition' },
  { category: 'PE Firm', query: '"Audax Private Equity" HVAC' },
  { category: 'PE Firm', query: '"Audax Private Equity" home services' },
  { category: 'PE Firm', query: '"Riverside Company" HVAC acquisition' },
  { category: 'PE Firm', query: '"Riverside Company" home services' },
  { category: 'PE Firm', query: '"Huron Capital" HVAC' },
  { category: 'PE Firm', query: '"Huron Capital" mechanical services' },
  { category: 'PE Firm', query: '"Kohlberg & Company" HVAC' },
  { category: 'PE Firm', query: '"Gridiron Capital" home services' },
  { category: 'PE Firm', query: '"Leonard Green & Partners" HVAC' },
  { category: 'PE Firm', query: '"Morgan Stanley Capital Partners" HVAC' },
  { category: 'PE Firm', query: '"Goldman Sachs" HVAC acquisition' },
  { category: 'PE Firm', query: '"Ares Management" home services' },
  { category: 'PE Firm', query: '"Partners Group" HVAC' },

  // Industry alerts
  { category: 'Industry', query: 'HVAC "private equity" acquisition' },
  { category: 'Industry', query: 'HVAC company acquired 2025' },
  { category: 'Industry', query: '"home services" private equity acquisition' },
  { category: 'Industry', query: 'residential HVAC acquisition announced' },
  { category: 'Industry', query: 'plumbing company acquired "private equity"' },
  { category: 'Industry', query: 'HVAC consolidation platform' },
  { category: 'Industry', query: '"PE-backed" HVAC' },
  { category: 'Industry', query: 'mechanical contractor acquired' },
  { category: 'Industry', query: 'HVAC M&A deal' },
  { category: 'Industry', query: 'air conditioning company acquisition' },
  { category: 'Industry', query: '"portfolio company" HVAC' },
  { category: 'Industry', query: 'home services roll-up' },
];

// Create workbook
const wb = XLSX.utils.book_new();

// Create alerts sheet data
const alertsData = [
  ['Complete', 'Category', 'Google Alert Query', 'Notes'],
  ...alerts.map(a => [false, a.category, a.query, ''])
];

const alertsSheet = XLSX.utils.aoa_to_sheet(alertsData);

// Set column widths
alertsSheet['!cols'] = [
  { wch: 10 },  // Complete
  { wch: 12 },  // Category
  { wch: 55 },  // Query
  { wch: 30 },  // Notes
];

// Create dashboard sheet
const totalAlerts = alerts.length;
const platformCount = alerts.filter(a => a.category === 'Platform').length;
const peCount = alerts.filter(a => a.category === 'PE Firm').length;
const industryCount = alerts.filter(a => a.category === 'Industry').length;

const dashboardData = [
  ['Google Alerts Setup Dashboard'],
  [''],
  ['Status', 'Count', 'Formula'],
  ['Total Alerts', totalAlerts, ''],
  ['Completed', '', '=COUNTIF(Alerts!A:A,TRUE)'],
  ['Remaining', '', '=B4-B5'],
  ['% Complete', '', '=IF(B4>0,B5/B4,0)'],
  [''],
  ['By Category', 'Total', 'Completed'],
  ['Platform', platformCount, '=COUNTIFS(Alerts!B:B,"Platform",Alerts!A:A,TRUE)'],
  ['PE Firm', peCount, '=COUNTIFS(Alerts!B:B,"PE Firm",Alerts!A:A,TRUE)'],
  ['Industry', industryCount, '=COUNTIFS(Alerts!B:B,"Industry",Alerts!A:A,TRUE)'],
  [''],
  ['Instructions:'],
  ['1. Go to https://google.com/alerts'],
  ['2. Copy each query from the Alerts sheet'],
  ['3. Click "Show options" and set:'],
  ['   - How often: As-it-happens'],
  ['   - Sources: Automatic'],
  ['   - Region: United States'],
  ['   - How many: All results'],
  ['4. Click "Create Alert"'],
  ['5. Mark Complete = TRUE in column A'],
];

const dashboardSheet = XLSX.utils.aoa_to_sheet(dashboardData);

// Set column widths for dashboard
dashboardSheet['!cols'] = [
  { wch: 20 },
  { wch: 12 },
  { wch: 45 },
];

// Add sheets to workbook
XLSX.utils.book_append_sheet(wb, dashboardSheet, 'Dashboard');
XLSX.utils.book_append_sheet(wb, alertsSheet, 'Alerts');

// Write file
const outputPath = './google-alerts-checklist.xlsx';
XLSX.writeFile(wb, outputPath);

console.log(`Created: ${outputPath}`);
console.log(`Total alerts: ${totalAlerts}`);
console.log(`- Platform: ${platformCount}`);
console.log(`- PE Firm: ${peCount}`);
console.log(`- Industry: ${industryCount}`);
