// ===== PYT HAIRSTYLE DASHBOARD JAVASCRIPT - MULTI-FORMAT SUPPORT =====
// PART 1/15

// Global Variables
let employeeData = [];
let shopMetrics = null;
let monthlyDataStore = {};
let detectedFormat = "unknown";

// Utility Functions
const money = (v) => parseFloat(String(v ?? "").replace(/[^0-9.-]+/g, "")) || 0;
const pct = (v) => parseFloat(String(v ?? "").replace(/[^0-9.-]+/g, "")) || 0;

// Enhanced Header Mapping for Multiple Formats
const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");

// COMPREHENSIVE HEADER MAPPING FOR BOTH FORMATS
const HEADER_MAP = {
  // Employee identification
  employee: "Employee",
  employeename: "Employee",
  name: "Employee",
  staff: "Employee",
  worker: "Employee",

  // Period/Date information
  period: "Period",
  month: "Period",
  date: "Period",
  monthyear: "Period",

  // Payment type
  paymenttype: "PaymentType",
  paymenttypehourlyonly: "PaymentType",
  paymentmethod: "PaymentType",
  paymentstructure: "PaymentType",
  paymenttypealltypes: "PaymentType",
  type: "PaymentType",
  // PART 2/15

  // Work metrics
  workeddays: "WorkedDays",
  workdays: "WorkedDays",
  daysworked: "WorkedDays",
  days: "WorkedDays",

  workedhours: "WorkedHours",
  hours: "WorkedHours",
  totalhours: "WorkedHours",
  hoursworked: "WorkedHours",

  // Hourly rate
  hourlyrate: "HourlyRate",
  rateperhour: "HourlyRate",
  hourlypay: "HourlyRate",
  rate: "HourlyRate",

  // Sales percentage/commission
  salespercentage: "SalesPercentage",
  salespercxentage: "SalesPercentage", // Handle typo
  salescommissionrate: "SalesPercentage",
  commissionrate: "SalesPercentage",
  salesrate: "SalesPercentage",
  sales: "SalesPercentage",
  commission: "SalesPercentage",

  // Base payment
  basepayment: "BasePayment",
  base: "BasePayment",
  basepay: "BasePayment",
  hourlyamount: "BasePayment",

  // Sales figures
  totalsales: "TotalSales",
  sales: "TotalSales",
  salesamount: "TotalSales",

  addlsales: "AddlSales",
  additionalsales: "AddlSales",
  extrasales: "AddlSales",
  bonussales: "AddlSales",

  adjustedsales: "AdjustedSales",
  totaladjustedsales: "AdjustedSales",
  finalsales: "AdjustedSales",
  // PART 3/15

  // Commission payments
  salescommission: "SalesCommission",
  commissionpayment: "SalesCommission",
  commissionamount: "SalesCommission",

  // Bonus payments
  bonuspayment: "BonusPayment",
  bonus: "BonusPayment",
  bonusamount: "BonusPayment",

  // Total before bonus (if exists)
  totalbeforebonus: "TotalBeforeBonus",
  pretotalbonus: "TotalBeforeBonus",

  // Final total
  finaltotal: "FinalTotal",
  finaltotalpayment: "FinalTotal",
  total: "FinalTotal",
  totalpayment: "FinalTotal",
  payment: "FinalTotal",

  // Performance metrics
  avgsalesperday: "AvgSalesPerDay",
  avgsalesday: "AvgSalesPerDay",
  averagesalesperday: "AvgSalesPerDay",
  dailyavgsales: "AvgSalesPerDay",

  avgsalesperhour: "AvgSalesPerHour",
  avgsaleshour: "AvgSalesPerHour",
  averagesalesperhour: "AvgSalesPerHour",
  hourlyavgsales: "AvgSalesPerHour",

  // Metadata
  description: "Description",
  desc: "Description",
  notes: "Description",
  paystructuredescription: "Description",

  configversion: "ConfigVersion",
  version: "ConfigVersion",
  config: "ConfigVersion",

  dataissues: "DataIssues",
  issues: "DataIssues",
  problems: "DataIssues",
  warnings: "DataIssues",
  // PART 4/15

  // Efficiency metrics
  salaryvsownsales: "SalaryToSalesPct",
  salarytosalespct: "SalaryToSalesPct",
  costefficiency: "SalaryToSalesPct",
  salaryefficiency: "SalaryToSalesPct",

  salesshareofshop: "SalesShareOfShop",
  salesshare: "SalesShareOfShop",
  marketshare: "SalesShareOfShop",

  salaryshareofshop: "SalaryShareOfShop",
  salaryshare: "SalaryShareOfShop",
  payrollshare: "SalaryShareOfShop",

  // Additional fields that might appear in new format
  field: "Field",
  value: "Value",
};

// FORMAT DETECTION
function detectDataFormat(rows) {
  if (!rows || rows.length === 0) return "empty";

  console.log("🔍 Detecting data format from", rows.length, "rows");

  // Check for August "Brava" format indicators
  const hasBravaIndicators = rows.some(
    (row) =>
      row.Field ||
      row.Value ||
      (row.Employee && row.Employee.includes("Employee:")) ||
      Object.keys(row).some(
        (key) => norm(key) === "field" || norm(key) === "value"
      )
  );

  // Check for July format indicators
  const hasJulyIndicators = rows.some(
    (row) =>
      row.Employee &&
      row.FinalTotal &&
      row.WorkedHours &&
      !row.Field &&
      !row.Value
  );

  // Count structured employee records
  const structuredRecords = rows.filter(
    (row) =>
      row.Employee &&
      row.Employee !== "Employee" &&
      row.FinalTotal &&
      !row.Employee.includes("SHOP_METRICS") &&
      !row.Employee.includes("TOTAL_SUMMARY")
  ).length;
  // PART 5/15

  let format = "unknown";

  if (hasBravaIndicators) {
    format = "brava_august";
  } else if (hasJulyIndicators && structuredRecords > 0) {
    format = "standard_july";
  } else if (structuredRecords > 0) {
    format = "standard_july"; // Default to July format for structured data
  }

  console.log(`📋 Format detected: ${format}`);
  console.log(`   - Brava indicators: ${hasBravaIndicators}`);
  console.log(`   - July indicators: ${hasJulyIndicators}`);
  console.log(`   - Structured records: ${structuredRecords}`);

  return format;
}

function updateFormatStatus(format) {
  const statusElement = document.getElementById("detectedFormat");
  const formatStatusElement = document.getElementById("formatStatus");

  if (!statusElement) return;

  detectedFormat = format;

  // Remove existing format classes
  formatStatusElement.classList.remove(
    "old-format",
    "new-format",
    "mixed-format"
  );

  switch (format) {
    case "brava_august":
      statusElement.textContent = "🆕 August 2025+ (New Brava CSV Format)";
      formatStatusElement.classList.add("new-format");
      break;
    case "standard_july":
      statusElement.textContent = "📅 July 2025 & Earlier (Original Format)";
      formatStatusElement.classList.add("old-format");
      break;
    case "mixed":
      statusElement.textContent = "🔀 Mixed Formats Detected";
      formatStatusElement.classList.add("mixed-format");
      break;
    default:
      statusElement.textContent = "❓ Unknown/Empty Format";
      break;
  }
}

function remapHeadersRow(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const mapped = HEADER_MAP[norm(k)] || k;
    out[mapped] = v;
  }
  return out;
}
// PART 6/15

// MAIN DATA PROCESSING FUNCTIONS
function receiveWorkflowData(data) {
  try {
    console.log("📥 Raw data received:", data);

    const rows = Array.isArray(data)
      ? data
      : data && Array.isArray(data.data)
      ? data.data
      : [data];

    console.log(`📊 Processing ${rows.length} rows`);

    // Detect format first
    const format = detectDataFormat(rows);
    updateFormatStatus(format);

    // Map headers
    const mappedRows = rows.map(remapHeadersRow);
    console.log("🔄 Sample mapped row:", mappedRows[0]);

    // Parse based on detected format
    let parsed;
    if (format === "brava_august") {
      parsed = parseBravaFormat(mappedRows);
    } else if (format === "standard_july") {
      parsed = parseStandardFormat(mappedRows);
    } else {
      // Try both formats and use the one that works
      console.log("🔍 Unknown format, trying both parsers...");
      try {
        parsed = parseStandardFormat(mappedRows);
        if (parsed.employees.length === 0) {
          parsed = parseBravaFormat(mappedRows);
        }
      } catch (e) {
        parsed = parseBravaFormat(mappedRows);
      }
    }

    employeeData = parsed.employees;
    shopMetrics = parsed.shopMetrics;

    console.log("✅ Parsed employees:", employeeData.length);
    console.log("✅ Shop metrics:", shopMetrics);

    renderEmployeeReports();
    document.getElementById("lastUpdated").textContent =
      new Date().toLocaleString();
    showStatus(
      `Data received successfully! Found ${employeeData.length} employees using ${format} format.`,
      "success"
    );
  } catch (error) {
    showStatus("Error processing data: " + error.message, "error");
    console.error("❌ Data processing error:", error);
    console.error("Raw data:", data);
  }
}
// PART 7/15

// BRAVA FORMAT PARSER (August 2025+)
function parseBravaFormat(rawData) {
  console.log("🆕 Parsing Brava format data");
  const employees = [];
  let shopMetrics = null;

  // Group data by employee
  const employeeGroups = {};
  let currentEmployee = null;

  for (const item of rawData) {
    // Skip header row
    if (item.Field === "Field" && item.Value === "Value") continue;

    // Detect employee header
    if (item.Field && item.Field.startsWith("Employee:")) {
      currentEmployee = item.Field.replace("Employee:", "").trim();
      if (!employeeGroups[currentEmployee]) {
        employeeGroups[currentEmployee] = {
          summary: {},
          daily: [],
        };
      }
      continue;
    }

    // Handle shop metrics
    if (item.Employee === "SHOP_METRICS") {
      shopMetrics = {
        period: item.Period,
        totalDays: parseFloat(item.WorkedDays) || 0,
        totalHours: parseFloat(item.WorkedHours) || 0,
        totalSales: money(item.AdjustedSales),
        totalSalaries: money(item.FinalTotal),
        shopEfficiency: pct(item.SalaryToSalesPct),
        description: item.Description || "Shop efficiency metrics",
      };
      continue;
    }

    // Collect summary data
    if (currentEmployee && item.Field && item.Value) {
      employeeGroups[currentEmployee].summary[item.Field] = item.Value;
    }

    // Collect daily data
    if (currentEmployee && item.Date && item.Hours) {
      employeeGroups[currentEmployee].daily.push({
        date: item.Date,
        hours: parseFloat(item.Hours) || 0,
        sales: money(item.Sales),
        addlSales: money(item.AddlSales),
      });
    }
  }
  // PART 8/15

  // Convert grouped data to employee objects
  for (const [name, data] of Object.entries(employeeGroups)) {
    const summary = data.summary;

    const employee = {
      name: name,
      period: detectPeriodFromData(data.daily),
      paymentType: "HOURLY ONLY", // Default for Brava format
      workedDays: parseInt(summary["Worked Days"]) || 0,
      workedHours: parseFloat(summary["Worked Hours"]) || 0,
      hourlyRate: money(summary["Rate per Hour"]),
      salesPercentage: "N/A", // Brava format typically hourly only
      basePayment: money(summary["Total Payment"]) || 0,
      totalSales: money(summary["Sales"]),
      addlSales: money(summary["Addl Sales"]),
      adjustedSales: money(summary["Sales"]) + money(summary["Addl Sales"]),
      salesCommission: 0, // Hourly only
      bonusPayment: 0,
      finalTotal: money(summary["Total Payment"]) || 0,
      avgSalesPerDay: money(summary["Avg Sale / Day"]),
      avgSalesPerHour: 0, // Calculate later
      description: "Hourly only payment structure (Brava format)",
      configVersion: "Brava-2025",
      dataIssues: "None",
      salaryToSalesPct: 0, // Calculate later
      salesShareOfShop: 0, // Calculate later
      salaryShareOfShop: 0, // Calculate later
    };

    // Calculate derived metrics
    if (employee.workedHours > 0) {
      employee.avgSalesPerHour = employee.adjustedSales / employee.workedHours;
    }

    if (employee.adjustedSales > 0) {
      employee.salaryToSalesPct =
        (employee.finalTotal / employee.adjustedSales) * 100;
    }

    employees.push(employee);
  }
  // PART 9/15

  // Calculate shop-wide metrics if not provided
  if (!shopMetrics && employees.length > 0) {
    const totalSales = employees.reduce((s, e) => s + e.adjustedSales, 0);
    const totalSalaries = employees.reduce((s, e) => s + e.finalTotal, 0);
    const totalDays = employees.reduce((s, e) => s + (e.workedDays || 0), 0);
    const totalHours = employees.reduce((s, e) => s + (e.workedHours || 0), 0);

    shopMetrics = {
      period: employees[0]?.period || "unknown",
      totalDays,
      totalHours,
      totalSales,
      totalSalaries,
      shopEfficiency: totalSales ? (totalSalaries / totalSales) * 100 : 0,
      description: "Shop efficiency metrics (computed from Brava data)",
    };
  }

  // Update shop share percentages
  if (shopMetrics) {
    employees.forEach((emp) => {
      if (shopMetrics.totalSales > 0) {
        emp.salesShareOfShop =
          (emp.adjustedSales / shopMetrics.totalSales) * 100;
      }
      if (shopMetrics.totalSalaries > 0) {
        emp.salaryShareOfShop =
          (emp.finalTotal / shopMetrics.totalSalaries) * 100;
      }
    });
  }

  console.log(`✅ Brava format parsed: ${employees.length} employees`);
  return { employees, shopMetrics };
}

// STANDARD FORMAT PARSER (July 2025 & Earlier)
function parseStandardFormat(rawData) {
  console.log("📅 Parsing standard format data");
  const employees = [];
  let shopMetrics = null;

  const dataArray = Array.isArray(rawData) ? rawData : [rawData];

  for (let i = 0; i < dataArray.length; i++) {
    const item = dataArray[i];

    if (!item || typeof item !== "object") continue;
    if (item.Employee === "Employee") continue; // Header row
    if (item.Employee && item.Employee.includes(" - Daily Breakdown")) continue;
    if (item.Employee && item.Employee === "TOTAL_SUMMARY") continue;
    if (item.Employee && item.Employee === "BONUS_SUMMARY") continue;
    // PART 10/15

    if (item.Employee && item.Employee === "SHOP_METRICS") {
      shopMetrics = {
        period: item.Period,
        totalDays: parseFloat(item.WorkedDays) || 0,
        totalHours: parseFloat(item.WorkedHours) || 0,
        totalSales: money(item.AdjustedSales),
        totalSalaries: money(item.FinalTotal),
        shopEfficiency: pct(item.SalaryToSalesPct),
        description: item.Description || "Shop efficiency metrics",
      };
      continue;
    }

    if (!item.Employee || item.Employee === "") continue;

    if (
      item.Employee &&
      item.Period &&
      item.WorkedDays &&
      !item.Employee.includes(" - ") &&
      item.FinalTotal
    ) {
      const employee = {
        name: item.Employee,
        period: item.Period,
        paymentType: item.PaymentType || "HYBRID",
        workedDays: parseFloat(item.WorkedDays) || 0,
        workedHours: parseFloat(item.WorkedHours) || 0,
        hourlyRate: money(item.HourlyRate),
        salesPercentage:
          item.SalesPercentage === "Tiered" || item.SalesPercentage === "N/A"
            ? item.SalesPercentage
            : pct(item.SalesPercentage) / 100,
        basePayment: money(item.BasePayment),
        totalSales: money(item.TotalSales),
        addlSales: money(item.AddlSales),
        adjustedSales: money(item.AdjustedSales),
        salesCommission: money(item.SalesCommission),
        bonusPayment: money(item.BonusPayment),
        totalBeforeBonus: money(item.TotalBeforeBonus),
        finalTotal: money(item.FinalTotal),
        avgSalesPerDay: money(item.AvgSalesPerDay),
        avgSalesPerHour: money(item.AvgSalesPerHour),
        description: item.Description || "Standard configuration",
        configVersion: item.ConfigVersion || "N/A",
        dataIssues: item.DataIssues || "None",
        salaryToSalesPct: pct(item.SalaryToSalesPct),
        salesShareOfShop: pct(item.SalesShareOfShop),
        salaryShareOfShop: pct(item.SalaryShareOfShop),
      };

      employees.push(employee);
    }
  }
  // PART 11/15

  // Calculate shop metrics if not provided
  if (!shopMetrics && employees.length > 0) {
    const totalSales = employees.reduce((s, e) => s + e.adjustedSales, 0);
    const totalSalaries = employees.reduce((s, e) => s + e.finalTotal, 0);
    const totalDays = employees.reduce((s, e) => s + (e.workedDays || 0), 0);
    const totalHours = employees.reduce((s, e) => s + (e.workedHours || 0), 0);

    shopMetrics = {
      period: employees[0]?.period || "unknown",
      totalDays,
      totalHours,
      totalSales,
      totalSalaries,
      shopEfficiency: totalSales ? (totalSalaries / totalSales) * 100 : 0,
      description: "Shop efficiency metrics (computed)",
    };
  }

  console.log(`✅ Standard format parsed: ${employees.length} employees`);
  return { employees, shopMetrics };
}

// UTILITY FUNCTIONS
function detectPeriodFromData(dailyData) {
  if (!dailyData || dailyData.length === 0) return "unknown";

  const firstDate = dailyData[0]?.date;
  if (!firstDate) return "unknown";

  try {
    const date = new Date(firstDate);
    return date.toISOString().slice(0, 7); // YYYY-MM format
  } catch (e) {
    return "unknown";
  }
}

// EFFICIENCY RATING FUNCTIONS
function getEfficiencyRating(salaryToSales, salesShare) {
  if (salesShare > 15 && salaryToSales < 25) return "⭐⭐⭐ Excellent";
  if (salesShare > 10 && salaryToSales < 35) return "⭐⭐ Good";
  if (salesShare > 5 && salaryToSales < 50) return "⭐ Fair";
  if (salaryToSales > 0) return "⚠️ Needs Improvement";
  return "📊 No Sales Data";
}

function getShopEfficiencyRating(efficiency) {
  if (efficiency < 15) return "🌟 Excellent Efficiency";
  if (efficiency < 20) return "✅ Very Good";
  if (efficiency < 25) return "👍 Good";
  if (efficiency < 30) return "⚠️ Acceptable";
  return "🔴 Needs Optimization";
}

function showStatus(message, type = "status") {
  const statusElement = document.getElementById("status");
  statusElement.textContent = message;
  statusElement.className = type;
}
// PART 12/15

// RENDERING FUNCTIONS
function renderEmployeeReports() {
  const container = document.getElementById("employeeReports");
  container.innerHTML = "";

  if (employeeData.length === 0) {
    container.innerHTML =
      '<div class="status">No employee data available</div>';
    return;
  }

  if (shopMetrics) {
    addShopSummarySection(container);
  }

  employeeData.forEach((emp, index) => {
    const section = document.createElement("div");
    section.className = "employee-section";

    const formatIndicator = detectedFormat === "brava_august" ? "NEW" : "STD";

    section.innerHTML = `
      <div class="employee-header">
        ${emp.name} - ${emp.period}
        <span style="float: right; font-size: 14px;">
          ${emp.paymentType} | Total: £${emp.finalTotal.toFixed(2)} | 
          <span style="color: #000;">
            ${((emp.finalTotal / emp.adjustedSales) * 100).toFixed(1)}%
          </span>
        </span>
      </div>
      <div class="summary-section">
        <table class="summary-table">
          <tr>
            <th style="width: 25%;">Metric</th>
            <th style="width: 20%;">Value</th>
            <th style="width: 55%;">Details</th>
          </tr>
          <tr>
            <td><strong>Payment Structure</strong></td>
            <td colspan="2"></td>
          </tr>
          <tr>
            <td>Payment Type</td>
            <td>${emp.paymentType}</td>
            <td>${emp.description}</td>
          </tr>
          <tr>
            <td>Config Version</td>
            <td>${emp.configVersion}</td>
            <td>Configuration tracking</td>
          </tr>
          <tr>
            <td>Data Quality</td>
            <td>${emp.dataIssues}</td>
            <td>Data validation results</td>
          </tr>
          <tr>
            <td><strong>Work Summary</strong></td>
            <td colspan="2"></td>
          </tr>
          <tr>
            <td>Worked Days</td>
            <td>${emp.workedDays}</td>
            <td>Total working days in period</td>
          </tr>
          <tr>
            <td>Worked Hours</td>
            <td>${emp.workedHours.toFixed(2)}</td>
            <td>Total hours logged</td>
          </tr>
          <tr>
            <td>Hourly Rate</td>
            <td class="currency">£${emp.hourlyRate.toFixed(2)}</td>
            <td>Base hourly payment rate</td>
          </tr>
          <tr>
            <td><strong>Sales & Commission</strong></td>
            <td colspan="2"></td>
          </tr>
          <tr>
            <td>Sales Commission Rate</td>
            <td>${
              typeof emp.salesPercentage === "string"
                ? emp.salesPercentage
                : (emp.salesPercentage * 100).toFixed(1) + "%"
            }</td>
            <td>Commission percentage on sales</td>
          </tr>
          <tr>
            <td>Total Sales</td>
            <td class="currency">£${emp.totalSales.toFixed(2)}</td>
            <td>Regular sales amount</td>
          </tr>
          <tr>
            <td>Additional Sales</td>
            <td class="currency">£${emp.addlSales.toFixed(2)}</td>
            <td>Extra sales/bonuses</td>
          </tr>
          <tr>
            <td>Adjusted Sales</td>
            <td class="currency">£${emp.adjustedSales.toFixed(2)}</td>
            <td>Total + Additional sales</td>
          </tr>
          <tr>
            <td><strong>Payment Calculation</strong></td>
            <td colspan="2"></td>
          </tr>
          <tr>
            <td>Base Payment</td>
            <td class="currency">£${emp.basePayment.toFixed(2)}</td>
            <td>${emp.workedHours.toFixed(2)} hours × £${emp.hourlyRate.toFixed(
      2
    )}/hour</td>
          </tr>
          <tr>
            <td>Sales Commission</td>
            <td class="currency">£${emp.salesCommission.toFixed(2)}</td>
            <td>£${emp.adjustedSales.toFixed(2)} × ${
      typeof emp.salesPercentage === "string"
        ? emp.salesPercentage
        : (emp.salesPercentage * 100).toFixed(1) + "%"
    }</td>
          </tr>
          <tr>
            <td>Bonus Payment</td>
            <td class="currency">£${emp.bonusPayment.toFixed(2)}</td>
            <td>Additional bonuses/guarantees</td>
          </tr>
          <tr class="totals-row">
            <td><strong>Final Total Payment</strong></td>
            <td class="currency"><strong>£${emp.finalTotal.toFixed(
              2
            )}</strong></td>
            <td><strong>Base + Commission + Bonuses</strong></td>
          </tr>
          <tr>
            <td><strong>Performance Metrics</strong></td>
            <td colspan="2"></td>
          </tr>
          <tr>
            <td>Average Sales per Day</td>
            <td class="currency">£${emp.avgSalesPerDay.toFixed(2)}</td>
            <td>£${emp.adjustedSales.toFixed(2)} ÷ ${emp.workedDays} days</td>
          </tr>
          <tr>
            <td>Average Sales per Hour</td>
            <td class="currency">£${emp.avgSalesPerHour.toFixed(2)}</td>
            <td>£${emp.adjustedSales.toFixed(2)} ÷ ${emp.workedHours.toFixed(
      2
    )} hours</td>
          </tr>
          <tr>
            <td>Earnings per Day</td>
            <td class="currency">£${(emp.finalTotal / emp.workedDays).toFixed(
              2
            )}</td>
            <td>Total payment ÷ working days</td>
          </tr>
          <tr>
            <td><strong>Business Efficiency Metrics</strong></td>
            <td colspan="2"></td>
          </tr>
          <tr class="efficiency-row">
            <td>Cost Efficiency</td>
            <td>${((emp.finalTotal / emp.adjustedSales) * 100).toFixed(2)}%</td>
            <td>Salary cost per £1 of sales (lower = better)</td>
          </tr>
          <tr class="efficiency-row">
            <td>Sales Share of Shop</td>
            <td>${
              shopMetrics
                ? ((emp.adjustedSales / shopMetrics.totalSales) * 100).toFixed(
                    2
                  )
                : emp.salesShareOfShop.toFixed(2)
            }%</td>
            <td>Contribution to total shop sales</td>
          </tr>
          <tr class="efficiency-row">
            <td>Salary Share of Shop</td>
            <td>${
              shopMetrics
                ? ((emp.finalTotal / shopMetrics.totalSalaries) * 100).toFixed(
                    2
                  )
                : emp.salaryShareOfShop.toFixed(2)
            }%</td>
            <td>Proportion of total shop payroll</td>
          </tr>
          <tr class="efficiency-row">
            <td>Efficiency Rating</td>
            <td>${getEfficiencyRating(
              (emp.finalTotal / emp.adjustedSales) * 100,
              shopMetrics
                ? (emp.adjustedSales / shopMetrics.totalSales) * 100
                : emp.salesShareOfShop
            )}</td>
            <td>Overall performance assessment</td>
          </tr>
        </table>
      </div>
    `;

    container.appendChild(section);
  });

  if (employeeData.length > 1) {
    addIndividualSummarySection(container);
  }
}
// PART 13/15

function addShopSummarySection(container) {
  const formatBadge =
    detectedFormat === "brava_august" ? "NEW FORMAT" : "STANDARD";

  const totalHours = employeeData.reduce(
    (sum, e) => sum + (e.workedHours || 0),
    0
  );
  const totalDays = employeeData.reduce(
    (sum, e) => sum + (e.workedDays || 0),
    0
  );
  const avgSalesPerHour =
    totalHours > 0 ? shopMetrics.totalSales / totalHours : 0;

  const summarySection = document.createElement("div");
  summarySection.className = "employee-section shop-summary";
  summarySection.innerHTML = `
    <div class="employee-header">
      🏪 Shop-Wide Performance Summary - ${shopMetrics.period}
      <span class="format-indicator">${formatBadge}</span>
    </div>
    <div class="summary-section">
      <table class="summary-table">
        <tr>
          <th>Metric</th>
          <th>Total Value</th>
          <th>Shop Efficiency Analysis</th>
        </tr>
        <tr>
          <td><strong>Total Sales</strong></td>
          <td class="currency"><strong>£${shopMetrics.totalSales.toFixed(
            2
          )}</strong></td>
          <td>All sales combined across ${employeeData.length} employees</td>
        </tr>
        <tr>
          <td><strong>Total Payroll</strong></td>
          <td class="currency"><strong>£${shopMetrics.totalSalaries.toFixed(
            2
          )}</strong></td>
          <td>All employee payments combined</td>
        </tr>
        <tr class="totals-row">
          <td><strong>Shop Efficiency Ratio</strong></td>
          <td><strong>${shopMetrics.shopEfficiency.toFixed(2)}%</strong></td>
          <td><strong>Salary cost per £1 of sales - ${getShopEfficiencyRating(
            shopMetrics.shopEfficiency
          )}</strong></td>
        </tr>
        <tr>
          <td>Total Hours Worked</td>
          <td>${totalHours.toFixed(2)}</td>
          <td>Combined work hours across all employees</td>
        </tr>
        <tr>
          <td>Total Working Days</td>
          <td>${totalDays}</td>
          <td>Combined working days across all employees</td>
        </tr>
        <tr>
          <td>Average Sales per Hour</td>
          <td class="currency">£${avgSalesPerHour.toFixed(2)}</td>
          <td>Shop productivity: sales generated per hour worked</td>
        </tr>
        <tr>
          <td>Profit Margin (Est.)</td>
          <td>${(100 - shopMetrics.shopEfficiency).toFixed(2)}%</td>
          <td>Estimated gross margin after salary costs</td>
        </tr>
        <tr>
          <td>Data Format</td>
          <td>${
            detectedFormat === "brava_august" ? "Brava CSV" : "Standard"
          }</td>
          <td>Format detected and used for processing</td>
        </tr>
      </table>
    </div>
  `;
  container.appendChild(summarySection);
}

function addIndividualSummarySection(container) {
  const totalPayment = employeeData.reduce(
    (sum, emp) => sum + emp.finalTotal,
    0
  );
  const totalSales = employeeData.reduce(
    (sum, emp) => sum + emp.adjustedSales,
    0
  );
  const totalCommission = employeeData.reduce(
    (sum, emp) => sum + emp.salesCommission,
    0
  );
  const totalHours = employeeData.reduce(
    (sum, emp) => sum + emp.workedHours,
    0
  );

  const summarySection = document.createElement("div");
  summarySection.className = "employee-section";
  summarySection.innerHTML = `
    <div class="employee-header">
      📊 Individual Employee Summary - ${employeeData.length} Employees
    </div>
    <div class="summary-section">
      <table class="summary-table">
        <tr>
          <th>Metric</th>
          <th>Total</th>
          <th>Average per Employee</th>
        </tr>
        <tr>
          <td>Total Hours Worked</td>
          <td>${totalHours.toFixed(2)}</td>
          <td>${(totalHours / employeeData.length).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Total Sales</td>
          <td class="currency">£${totalSales.toFixed(2)}</td>
          <td class="currency">£${(totalSales / employeeData.length).toFixed(
            2
          )}</td>
        </tr>
        <tr>
          <td>Total Commission</td>
          <td class="currency">£${totalCommission.toFixed(2)}</td>
          <td class="currency">£${(
            totalCommission / employeeData.length
          ).toFixed(2)}</td>
        </tr>
        <tr class="totals-row">
          <td><strong>Total Payments</strong></td>
          <td class="currency"><strong>£${totalPayment.toFixed(2)}</strong></td>
          <td class="currency"><strong>£${(
            totalPayment / employeeData.length
          ).toFixed(2)}</strong></td>
        </tr>
      </table>
    </div>
  `;
  container.appendChild(summarySection);
}
// PART 14/15

// GOOGLE SHEETS INTEGRATION
async function fetchFromGoogleSheets() {
  const sheetTab = document.getElementById("sheetTab").value || "august";
  const sheetId = "1RCYrnoRL3_0ZVKTyxJknVdxJ5kK_eftonoys7KJg1MQ";

  showStatus(
    `🔄 Fetching data from Google Sheets (${sheetTab} tab)...`,
    "status"
  );

  const urlsToTry = [
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
      sheetTab
    )}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&sheet=${encodeURIComponent(
      sheetTab
    )}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=0`,
  ];

  for (let i = 0; i < urlsToTry.length; i++) {
    const csvUrl = urlsToTry[i];
    console.log(`🔗 Trying URL ${i + 1}:`, csvUrl);

    try {
      const response = await fetch(csvUrl, {
        method: "GET",
        mode: "cors",
      });

      if (!response.ok) {
        console.log(`❌ URL ${i + 1} failed with status:`, response.status);
        continue;
      }

      console.log(`✅ Response ${i + 1} status:`, response.status);

      const csvText = await response.text();
      console.log(`📄 CSV length: ${csvText.length} characters`);

      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => String(h || "").trim(),
      });

      const rows = (parsed.data || []).map(remapHeadersRow);

      console.log("📋 Headers seen:", parsed.meta?.fields);
      console.log("📊 Sample mapped row:", rows[1]);
      console.log(`📈 Total rows: ${rows.length}`);

      if (rows.length > 0) {
        receiveWorkflowData(rows);
        return;
      } else {
        console.log(`⚠️ URL ${i + 1} returned no data`);
      }
    } catch (error) {
      console.log(`❌ URL ${i + 1} failed:`, error.message);
    }
  }

  showStatus(
    `❌ Unable to fetch data for "${sheetTab}" tab. Please check: 1) Sheet is shared publicly (Anyone with link can view), 2) Tab "${sheetTab}" exists, 3) Tab contains data`,
    "error"
  );
}

async function fetchAndCompareSheets() {
  const sheet1 = document.getElementById("sheetTab").value || "august";
  const sheet2 = document.getElementById("compareSheet").value;

  if (!sheet2) {
    alert("Please enter a second sheet name to compare with");
    return;
  }

  if (sheet1 === sheet2) {
    alert("Please enter different sheet names to compare");
    return;
  }

  showStatus(`🔄 Loading ${sheet1} and ${sheet2} for comparison...`, "status");

  try {
    // Store original monthlyDataStore
    const originalData = JSON.parse(JSON.stringify(monthlyDataStore));

    // Fetch first sheet
    document.getElementById("sheetTab").value = sheet1;
    await fetchFromGoogleSheets();
    const data1 = {
      employees: JSON.parse(JSON.stringify(employeeData)),
      shopMetrics: shopMetrics ? JSON.parse(JSON.stringify(shopMetrics)) : null,
      format: detectedFormat,
    };

    // Fetch second sheet
    document.getElementById("sheetTab").value = sheet2;
    await fetchFromGoogleSheets();
    const data2 = {
      employees: JSON.parse(JSON.stringify(employeeData)),
      shopMetrics: shopMetrics ? JSON.parse(JSON.stringify(shopMetrics)) : null,
      format: detectedFormat,
    };

    // Store both datasets
    monthlyDataStore[sheet1] = data1;
    monthlyDataStore[sheet2] = data2;

    renderSheetComparison(data1, data2, sheet1, sheet2);
    document.getElementById("sheetTab").value = sheet1;

    // Update format status to show mixed
    if (data1.format !== data2.format) {
      updateFormatStatus("mixed");
    }
  } catch (error) {
    showStatus("Error comparing sheets: " + error.message, "error");
  }
}

// DEBUGGING FUNCTIONS
function debugSheetHeaders() {
  const sheetTab = document.getElementById("sheetTab").value || "august";

  showStatus("🔍 Debugging sheet headers...", "status");

  fetchRawSheetData(sheetTab)
    .then((csvText) => {
      const lines = csvText.split("\n");
      const headers = lines[0]
        .split(",")
        .map((h) => h.replace(/"/g, "").trim());

      const debugOutput = document.getElementById("debugOutput");
      const debugContent = document.getElementById("debugContent");

      let debugInfo = `=== SHEET DEBUG: ${sheetTab.toUpperCase()} ===\n\n`;
      debugInfo += `Total lines: ${lines.length}\n`;
      debugInfo += `Headers found: ${headers.length}\n\n`;

      debugInfo += `RAW HEADERS:\n`;
      headers.forEach((header, i) => {
        debugInfo += `${i + 1}. "${header}" -> normalized: "${norm(
          header
        )}" -> mapped: "${HEADER_MAP[norm(header)] || "NOT MAPPED"}"\n`;
      });

      debugInfo += `\nSAMPLE DATA ROWS:\n`;
      for (let i = 1; i <= Math.min(3, lines.length - 1); i++) {
        debugInfo += `Row ${i}: ${lines[i].substring(0, 100)}...\n`;
      }

      debugContent.textContent = debugInfo;
      debugOutput.style.display = "block";

      showStatus(`🔍 Debug complete for ${sheetTab}`, "success");
    })
    .catch((error) => {
      showStatus(`❌ Debug failed: ${error.message}`, "error");
    });
}

function showFormatMapping() {
  const debugOutput = document.getElementById("debugOutput");
  const debugContent = document.getElementById("debugContent");

  let mappingInfo = `=== FORMAT MAPPING REFERENCE ===\n\n`;

  mappingInfo += `CURRENT DETECTED FORMAT: ${detectedFormat}\n\n`;

  mappingInfo += `HEADER MAPPINGS (${Object.keys(HEADER_MAP).length} total):\n`;
  Object.entries(HEADER_MAP).forEach(([key, value]) => {
    mappingInfo += `"${key}" -> "${value}"\n`;
  });

  mappingInfo += `\nFORMAT DETECTION LOGIC:\n`;
  mappingInfo += `- Brava August: Looks for "Field" and "Value" columns\n`;
  mappingInfo += `- Standard July: Looks for structured employee records\n`;
  mappingInfo += `- Mixed: When different formats detected in comparison\n`;

  mappingInfo += `\nCURRENT DATA SUMMARY:\n`;
  mappingInfo += `- Employees loaded: ${employeeData.length}\n`;
  mappingInfo += `- Shop metrics: ${
    shopMetrics ? "Available" : "Not available"
  }\n`;
  mappingInfo += `- Last updated: ${
    document.getElementById("lastUpdated").textContent
  }\n`;

  debugContent.textContent = mappingInfo;
  debugOutput.style.display = "block";

  showStatus("📋 Format mapping displayed", "success");
}

async function testBothFormats() {
  const sheetTab = document.getElementById("sheetTab").value || "august";

  showStatus("🧪 Testing both format parsers...", "status");

  try {
    const csvText = await fetchRawSheetData(sheetTab);
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => String(h || "").trim(),
    });

    const rows = (parsed.data || []).map(remapHeadersRow);

    let testResults = `=== FORMAT PARSER TEST: ${sheetTab.toUpperCase()} ===\n\n`;

    // Test Standard Format Parser
    try {
      const standardResult = parseStandardFormat(rows);
      testResults += `STANDARD FORMAT PARSER:\n`;
      testResults += `✅ Employees found: ${standardResult.employees.length}\n`;
      testResults += `✅ Shop metrics: ${
        standardResult.shopMetrics ? "Available" : "Not available"
      }\n`;

      if (standardResult.employees.length > 0) {
        testResults += `Sample employee: ${
          standardResult.employees[0].name
        } - £${standardResult.employees[0].finalTotal.toFixed(2)}\n`;
      }
    } catch (error) {
      testResults += `STANDARD FORMAT PARSER:\n`;
      testResults += `❌ Error: ${error.message}\n`;
    }

    testResults += `\n`;

    // Test Brava Format Parser
    try {
      const bravaResult = parseBravaFormat(rows);
      testResults += `BRAVA FORMAT PARSER:\n`;
      testResults += `✅ Employees found: ${bravaResult.employees.length}\n`;
      testResults += `✅ Shop metrics: ${
        bravaResult.shopMetrics ? "Available" : "Not available"
      }\n`;

      if (bravaResult.employees.length > 0) {
        testResults += `Sample employee: ${
          bravaResult.employees[0].name
        } - £${bravaResult.employees[0].finalTotal.toFixed(2)}\n`;
      }
    } catch (error) {
      testResults += `BRAVA FORMAT PARSER:\n`;
      testResults += `❌ Error: ${error.message}\n`;
    }

    // Auto-detection result
    const autoFormat = detectDataFormat(rows);
    testResults += `\nAUTO-DETECTION RESULT: ${autoFormat}\n`;

    const debugOutput = document.getElementById("debugOutput");
    const debugContent = document.getElementById("debugContent");
    debugContent.textContent = testResults;
    debugOutput.style.display = "block";

    showStatus("🧪 Format testing complete", "success");
  } catch (error) {
    showStatus(`❌ Format testing failed: ${error.message}`, "error");
  }
}

async function fetchRawSheetData(sheetTab) {
  const sheetId = "1RCYrnoRL3_0ZVKTyxJknVdxJ5kK_eftonoys7KJg1MQ";
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
    sheetTab
  )}`;

  const response = await fetch(csvUrl, { method: "GET", mode: "cors" });
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: ${response.status}`);
  }

  return await response.text();
}
// PART 15/15 (FINAL)

// SHEET COMPARISON RENDERING
function renderSheetComparison(data1, data2, sheet1, sheet2) {
  const container = document.getElementById("employeeReports");
  const format1Badge = data1.format === "brava_august" ? "NEW" : "STD";
  const format2Badge = data2.format === "brava_august" ? "NEW" : "STD";

  let html = `
    <div class="comparison-view">
      <h2>📊 Sheet Comparison: ${sheet1.toUpperCase()} vs ${sheet2.toUpperCase()}</h2>
      
      <div class="comparison-section">
        <div class="comparison-header">
          🏪 Shop Performance Comparison
          <div class="format-badges">
            <span class="format-badge">${sheet1}: ${format1Badge}</span>
            <span class="format-badge">${sheet2}: ${format2Badge}</span>
          </div>
        </div>
        <div style="padding: 15px;">
          <table class="comparison-table">
            <tr>
              <th>Metric</th>
              <th>${sheet1.toUpperCase()}</th>
              <th>${sheet2.toUpperCase()}</th>
              <th>Difference</th>
              <th>Change %</th>
            </tr>
  `;

  if (data1.shopMetrics && data2.shopMetrics) {
    const metrics = [
      {
        key: "totalSales",
        label: "Total Sales",
        format: (v) => `£${v.toLocaleString()}`,
      },
      {
        key: "totalSalaries",
        label: "Total Payroll",
        format: (v) => `£${v.toLocaleString()}`,
      },
      {
        key: "shopEfficiency",
        label: "Shop Efficiency",
        format: (v) => `${v.toFixed(2)}%`,
      },
      { key: "totalHours", label: "Total Hours", format: (v) => v.toFixed(1) },
    ];

    metrics.forEach((metric) => {
      const val1 = data1.shopMetrics[metric.key] || 0;
      const val2 = data2.shopMetrics[metric.key] || 0;
      const diff = val1 - val2;
      const changePercent = val2 !== 0 ? (diff / val2) * 100 : 0;
      const trendClass =
        diff > 0 ? "improvement" : diff < 0 ? "decline" : "stable";
      const trendIcon = diff > 0 ? "📈" : diff < 0 ? "📉" : "➡️";

      html += `
        <tr>
          <td><strong>${metric.label}</strong></td>
          <td>${metric.format(val1)}</td>
          <td>${metric.format(val2)}</td>
          <td class="${trendClass}">${trendIcon} ${
        diff > 0 ? "+" : ""
      }${metric.format(Math.abs(diff))}</td>
          <td class="${trendClass}">${
        changePercent > 0 ? "+" : ""
      }${changePercent.toFixed(1)}%</td>
        </tr>`;
    });
  }

  html += `</table></div></div><h3>👥 Employee Performance Comparison</h3>`;

  const allEmployees = new Set();
  data1.employees?.forEach((emp) => allEmployees.add(emp.name));
  data2.employees?.forEach((emp) => allEmployees.add(emp.name));

  Array.from(allEmployees)
    .sort()
    .forEach((employeeName) => {
      const emp1 = data1.employees?.find((e) => e.name === employeeName);
      const emp2 = data2.employees?.find((e) => e.name === employeeName);

      html += `
      <div class="comparison-section">
        <div class="comparison-header">
          ${employeeName} - Performance Comparison
          <div class="format-badges">
            ${
              emp1
                ? `<span class="format-badge">${sheet1}: ${format1Badge}</span>`
                : ""
            }
            ${
              emp2
                ? `<span class="format-badge">${sheet2}: ${format2Badge}</span>`
                : ""
            }
          </div>
        </div>
        <div style="padding: 15px;">
          <table class="comparison-table">
            <tr>
              <th>Metric</th>
              <th>${sheet1.toUpperCase()}</th>
              <th>${sheet2.toUpperCase()}</th>
              <th>Difference</th>
              <th>Change %</th>
            </tr>`;

      const comparisonMetrics = [
        {
          key: "adjustedSales",
          label: "Sales",
          format: (v) => `£${v.toLocaleString()}`,
        },
        {
          key: "finalTotal",
          label: "Salary",
          format: (v) => `£${v.toLocaleString()}`,
        },
        {
          key: "workedHours",
          label: "Hours Worked",
          format: (v) => v.toFixed(1),
        },
        {
          key: "avgSalesPerDay",
          label: "Avg Sales/Day",
          format: (v) => `£${v.toFixed(0)}`,
        },
        {
          key: "salaryToSalesPct",
          label: "Cost Efficiency %",
          format: (v) => `${v.toFixed(1)}%`,
        },
      ];

      comparisonMetrics.forEach((metric) => {
        const val1 = emp1?.[metric.key];
        const val2 = emp2?.[metric.key];

        if (val1 !== undefined && val2 !== undefined) {
          const diff = val1 - val2;
          const changePercent = val2 !== 0 ? (diff / val2) * 100 : 0;
          let trendClass, trendIcon;
          if (metric.key === "salaryToSalesPct") {
            trendClass =
              diff < 0 ? "improvement" : diff > 0 ? "decline" : "stable";
            trendIcon = diff < 0 ? "📈" : diff > 0 ? "📉" : "➡️";
          } else {
            trendClass =
              diff > 0 ? "improvement" : diff < 0 ? "decline" : "stable";
            trendIcon = diff > 0 ? "📈" : diff < 0 ? "📉" : "➡️";
          }

          html += `
          <tr>
            <td>${metric.label}</td>
            <td>${metric.format(val1)}</td>
            <td>${metric.format(val2)}</td>
            <td class="${trendClass}">${trendIcon} ${
            diff > 0 ? "+" : ""
          }${metric.format(Math.abs(diff))}</td>
            <td class="${trendClass}">${
            changePercent > 0 ? "+" : ""
          }${changePercent.toFixed(1)}%</td>
          </tr>`;
        } else {
          html += `
          <tr>
            <td>${metric.label}</td>
            <td>${val1 ? metric.format(val1) : "N/A"}</td>
            <td>${val2 ? metric.format(val2) : "N/A"}</td>
            <td>N/A</td>
            <td>N/A</td>
          </tr>`;
        }
      });

      html += `</table></div></div>`;
    });

  html += "</div>";
  container.innerHTML = html;

  const formatMessage =
    data1.format !== data2.format
      ? ` (Note: Different formats detected - ${sheet1}: ${data1.format}, ${sheet2}: ${data2.format})`
      : "";

  showStatus(
    `✅ Comparison completed: ${sheet1} vs ${sheet2}${formatMessage}`,
    "success"
  );
}

// TEST DATA AND UTILITY FUNCTIONS
function loadTestData() {
  const testDataAugust = [
    {
      Field: "Field",
      Value: "Value",
      Date: "Date",
      Hours: "Hours",
      Sales: "Sales",
      AddlSales: "Addl Sales",
    },
    { Field: "Employee: Aisha" },
    { Field: "Worked Days", Value: "14" },
    { Field: "Worked Hours", Value: "79.82" },
    { Field: "Sales", Value: "£ 2234.98" },
    { Field: "Addl Sales", Value: "£ 135.00" },
    { Field: "Rate per Hour", Value: "£ 12.21" },
    { Field: "Total Payment", Value: "£ 974.62" },
    { Field: "Avg Sale / Day", Value: "£ 169.28" },
    {
      Employee: "SHOP_METRICS",
      Period: "2025-08",
      PaymentType: "ALL_TYPES",
      WorkedDays: "318",
      WorkedHours: "1587.45",
      AdjustedSales: "£31245.87",
      FinalTotal: "£8567.42",
      Description: "Shop efficiency: 27.42% salary cost of total sales",
      SalaryToSalesPct: "27.42%",
      SalesShareOfShop: "100.00%",
      SalaryShareOfShop: "100.00%",
    },
  ];

  console.log("🧪 Loading test data (August Brava format)");
  receiveWorkflowData(testDataAugust);
}

function clearData() {
  employeeData = [];
  shopMetrics = null;
  monthlyDataStore = {};
  detectedFormat = "unknown";

  document.getElementById("employeeReports").innerHTML = "";
  document.getElementById("status").className = "status";
  document.getElementById("status").textContent =
    "Data cleared. Waiting for new data...";
  document.getElementById("lastUpdated").textContent = "Not yet loaded";
  updateFormatStatus("unknown");

  const debugOutput = document.getElementById("debugOutput");
  if (debugOutput) debugOutput.style.display = "none";
}

function exportToExcel() {
  if (employeeData.length === 0) {
    alert("No data to export");
    return;
  }

  const wb = XLSX.utils.book_new();
  const summaryData = [
    ["Employee Payment Report - Multi-Format Support"],
    ["Generated:", new Date().toLocaleString()],
    ["Format Detected:", detectedFormat],
    [""],
    [
      "Employee",
      "Period",
      "Payment Type",
      "Worked Days",
      "Worked Hours",
      "Hourly Rate",
      "Sales %",
      "Base Payment",
      "Total Sales",
      "Addl Sales",
      "Adjusted Sales",
      "Sales Commission",
      "Bonus Payment",
      "Final Total",
      "Avg Sales/Day",
      "Avg Sales/Hour",
      "Cost Efficiency %",
      "Sales Share %",
      "Salary Share %",
      "Efficiency Rating",
    ],
  ];

  employeeData.forEach((emp) => {
    summaryData.push([
      emp.name,
      emp.period,
      emp.paymentType,
      emp.workedDays,
      emp.workedHours.toFixed(2),
      emp.hourlyRate.toFixed(2),
      typeof emp.salesPercentage === "string"
        ? emp.salesPercentage
        : (emp.salesPercentage * 100).toFixed(1) + "%",
      emp.basePayment.toFixed(2),
      emp.totalSales.toFixed(2),
      emp.addlSales.toFixed(2),
      emp.adjustedSales.toFixed(2),
      emp.salesCommission.toFixed(2),
      emp.bonusPayment.toFixed(2),
      emp.finalTotal.toFixed(2),
      emp.avgSalesPerDay.toFixed(2),
      emp.avgSalesPerHour.toFixed(2),
      emp.salaryToSalesPct.toFixed(2) + "%",
      emp.salesShareOfShop.toFixed(2) + "%",
      emp.salaryShareOfShop.toFixed(2) + "%",
      getEfficiencyRating(emp.salaryToSalesPct, emp.salesShareOfShop),
    ]);
  });

  if (shopMetrics) {
    summaryData.push(
      [],
      ["SHOP SUMMARY"],
      [
        "Total Sales",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        shopMetrics.totalSales.toFixed(2),
      ],
      [
        "Total Payroll",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        shopMetrics.totalSalaries.toFixed(2),
      ],
      [
        "Shop Efficiency",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        shopMetrics.shopEfficiency.toFixed(2) + "%",
      ]
    );
  }

  const ws = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws, "Payment Summary");
  const filename = `Employee_Payments_${detectedFormat}_${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// MULTI-MONTH FUNCTIONALITY
function initializeMonthlyTabs() {
  const tabs = document.querySelectorAll(".month-tab");
  const comparisonControls = document.getElementById("comparisonControls");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      if (this.dataset.mode === "comparison") {
        comparisonControls.style.display = "block";
      } else {
        comparisonControls.style.display = "none";
        if (employeeData.length > 0) renderEmployeeReports();
      }
    });
  });
}

function loadMonthlyComparison() {
  const month1 = document.getElementById("month1Select").value;
  const month2 = document.getElementById("month2Select").value;

  if (month1 === month2) {
    alert("Please select different months to compare");
    return;
  }

  document.getElementById("sheetTab").value = month1;
  document.getElementById("compareSheet").value = month2;
  fetchAndCompareSheets();
}

function loadHistoricalData() {
  alert(
    "📚 Historical data loading: Use the comparison feature above to load and compare multiple months. The dashboard now automatically handles both old (July) and new (August+) formats!"
  );
}

function exportComparisonToExcel() {
  if (Object.keys(monthlyDataStore).length < 2) {
    alert("Please load comparison data first using 'Compare Two Sheets'");
    return;
  }

  const wb = XLSX.utils.book_new();

  Object.entries(monthlyDataStore).forEach(([month, data]) => {
    if (data.employees && data.employees.length > 0) {
      const monthData = [
        [`${month.toUpperCase()} Employee Data - Format: ${data.format}`],
        [""],
        [
          "Employee",
          "Final Total",
          "Adjusted Sales",
          "Worked Hours",
          "Cost Efficiency %",
        ],
      ];

      data.employees.forEach((emp) => {
        monthData.push([
          emp.name,
          emp.finalTotal.toFixed(2),
          emp.adjustedSales.toFixed(2),
          emp.workedHours.toFixed(2),
          emp.salaryToSalesPct.toFixed(2) + "%",
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(monthData);
      XLSX.utils.book_append_sheet(wb, ws, month.substring(0, 31));
    }
  });

  const filename = `Multi_Month_Comparison_${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// URL PARAMETER HANDLING
window.addEventListener("load", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const dataParam = urlParams.get("data");

  if (dataParam) {
    try {
      const data = JSON.parse(decodeURIComponent(dataParam));
      receiveWorkflowData(data);
    } catch (error) {
      showStatus("Error parsing URL data: " + error.message, "error");
    }
  }
});

// GLOBAL FUNCTIONS FOR WEBHOOK INTEGRATION
if (typeof window.receiveWebhookData === "undefined") {
  window.receiveWebhookData = receiveWorkflowData;
}

// INITIALIZE WHEN PAGE LOADS
document.addEventListener("DOMContentLoaded", function () {
  initializeMonthlyTabs();
  console.log("🚀 PYT Dashboard initialized with multi-format support");
  console.log("📋 Supported formats: Standard (July), Brava (August+)");
});
