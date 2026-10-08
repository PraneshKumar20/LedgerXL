/**
 * test_weekly_trend.js
 * Verification suite for 7-Day Spending Trend dynamic weekly aggregation.
 * Tests all 10 specifications from Phase 7-Day Spending Trend.
 */

import { getWeeklyTrendData, getCalendarDateKey, getStartOfWeekMonday } from "./src/utils/weeklyTrend.js"

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`)
    passed++
  } else {
    console.error(`  ✗ FAIL: ${message}`)
    failed++
  }
}

console.log("\n========================================================")
console.log("   7-DAY SPENDING TREND DYNAMIC VERIFICATION SUITE   ")
console.log("========================================================\n")

// Reference Date: Thursday, October 8, 2026
// Current week: Monday, Oct 5, 2026 -> Sunday, Oct 11, 2026
const refThursday = new Date(2026, 9, 8) // Month is 0-indexed: 9 = October

// --- TEST 1: Transactions spanning multiple weeks only contribute to the current week ---
console.log("--- TEST 1: Weekly Window Boundary Isolation ---")
{
  const mockTransactions = [
    { date: "2026-09-28", amount: 5000, type: "expense" }, // Last week
    { date: "2026-10-04", amount: 2000, type: "expense" }, // Previous Sunday
    { date: "2026-10-06", amount: 1500, type: "expense" }, // Current week Tuesday
    { date: "2026-10-12", amount: 3000, type: "expense" }, // Next week Monday
  ]
  const trend = getWeeklyTrendData(mockTransactions, { referenceDate: refThursday })
  const totalExpense = trend.reduce((sum, d) => sum + d.expense, 0)
  assert(totalExpense === 1500, `Only current week transaction (1500) included. Actual total: ${totalExpense}`)
}

// --- TEST 2: Exactly 7 days are returned ---
console.log("\n--- TEST 2: Fixed 7-Day Window Length ---")
{
  const trendEmpty = getWeeklyTrendData([], { referenceDate: refThursday })
  assert(trendEmpty.length === 7, `Returns exactly 7 data points for empty transactions (got ${trendEmpty.length})`)

  const trendWithData = getWeeklyTrendData([
    { date: "2026-10-05", amount: 100, type: "expense" },
    { date: "2026-10-07", amount: 200, type: "expense" },
  ], { referenceDate: refThursday })
  assert(trendWithData.length === 7, `Returns exactly 7 data points with transactions (got ${trendWithData.length})`)
}

// --- TEST 3: Multiple expenses on the same day are summed ---
console.log("\n--- TEST 3: Same-Day Expense Summation ---")
{
  const mockTransactions = [
    { date: "2026-10-07", amount: 500, type: "expense" },
    { date: "2026-10-07", amount: 250, type: "expense" },
    { date: "2026-10-07", amount: 75.50, type: "expense" },
  ]
  const trend = getWeeklyTrendData(mockTransactions, { referenceDate: refThursday })
  const wednesday = trend.find(d => d.dateKey === "2026-10-07")
  assert(wednesday && wednesday.expense === 825.50, `Multiple expenses summed correctly to 825.50. Actual: ${wednesday?.expense}`)
}

// --- TEST 4: Income transactions are excluded from spending ---
console.log("\n--- TEST 4: Income Exclusion from Spending ---")
{
  const mockTransactions = [
    { date: "2026-10-08", amount: 50000, type: "income" },
    { date: "2026-10-08", amount: 1200, type: "expense" },
  ]
  const trend = getWeeklyTrendData(mockTransactions, { referenceDate: refThursday })
  const thursday = trend.find(d => d.dateKey === "2026-10-08")
  assert(thursday && thursday.expense === 1200, `Income excluded from expense. Expected expense 1200, got: ${thursday?.expense}`)
  assert(thursday && thursday.income === 50000, `Income properly tracked in income metric: ${thursday?.income}`)
}

// --- TEST 5: Days with no expenses return zero ---
console.log("\n--- TEST 5: Zero-Value Days Preserved ---")
{
  const mockTransactions = [
    { date: "2026-10-06", amount: 450, type: "expense" } // Only Tuesday
  ]
  const trend = getWeeklyTrendData(mockTransactions, { referenceDate: refThursday })
  const mon = trend.find(d => d.dateKey === "2026-10-05")
  const wed = trend.find(d => d.dateKey === "2026-10-07")
  const fri = trend.find(d => d.dateKey === "2026-10-09")
  const sat = trend.find(d => d.dateKey === "2026-10-10")
  const sun = trend.find(d => d.dateKey === "2026-10-11")

  assert(mon?.expense === 0, `Monday has zero expense (got ${mon?.expense})`)
  assert(wed?.expense === 0, `Wednesday has zero expense (got ${wed?.expense})`)
  assert(fri?.expense === 0, `Friday has zero expense (got ${fri?.expense})`)
  assert(sat?.expense === 0, `Saturday has zero expense (got ${sat?.expense})`)
  assert(sun?.expense === 0, `Sunday has zero expense (got ${sun?.expense})`)
}

// --- TEST 6: Monday starts a new reporting week ---
console.log("\n--- TEST 6: Automatic Monday Rollover ---")
{
  const mondayNextWeek = new Date(2026, 9, 12) // Monday Oct 12, 2026
  const trend = getWeeklyTrendData([], { referenceDate: mondayNextWeek })
  assert(trend[0].dateKey === "2026-10-12", `Week starts on Monday Oct 12 (got ${trend[0].dateKey})`)
  assert(trend[0].dayName === "Mon", `Day 0 is Monday (got ${trend[0].dayName})`)
  assert(trend[6].dateKey === "2026-10-18", `Week ends on Sunday Oct 18 (got ${trend[6].dateKey})`)
  assert(trend[6].dayName === "Sun", `Day 6 is Sunday (got ${trend[6].dayName})`)
}

// --- TEST 7: Sunday belongs to the current week ---
console.log("\n--- TEST 7: Sunday Week Inclusion ---")
{
  const sunday = new Date(2026, 9, 11) // Sunday Oct 11, 2026
  const mondayOfSunday = getStartOfWeekMonday(sunday)
  const mondayKey = getCalendarDateKey(mondayOfSunday)
  assert(mondayKey === "2026-10-05", `Sunday Oct 11 maps to week starting Monday Oct 5 (got ${mondayKey})`)

  const mockTransactions = [
    { date: "2026-10-11", amount: 999, type: "expense" }
  ]
  const trend = getWeeklyTrendData(mockTransactions, { referenceDate: sunday })
  const sunData = trend.find(d => d.dateKey === "2026-10-11")
  assert(sunData && sunData.expense === 999, `Sunday transaction captured in current week: ${sunData?.expense}`)
}

// --- TEST 8: Date boundary and ISO normalization ---
console.log("\n--- TEST 8: Date Boundary & ISO Normalization ---")
{
  const isoDate = "2026-10-08T00:00:00.000Z"
  const rawDate = "2026-10-08"
  assert(getCalendarDateKey(isoDate) === "2026-10-08", `ISO midnight normalized without timezone shift: ${getCalendarDateKey(isoDate)}`)
  assert(getCalendarDateKey(rawDate) === "2026-10-08", `Raw YYYY-MM-DD preserved: ${getCalendarDateKey(rawDate)}`)

  const mockTransactions = [
    { date: isoDate, amount: 400, type: "expense" }
  ]
  const trend = getWeeklyTrendData(mockTransactions, { referenceDate: refThursday })
  const thuData = trend.find(d => d.dateKey === "2026-10-08")
  assert(thuData && thuData.expense === 400, `Transaction assigned to correct calendar day (Thu 8): ${thuData?.expense}`)
}

// --- TEST 9: User data scoping ---
console.log("\n--- TEST 9: Scoped User Transactions ---")
{
  // Simulates client displayExpenses containing only the authenticated user's records
  const userAExpenses = [
    { userId: "user-A", date: "2026-10-08", amount: 1500, type: "expense" }
  ]
  const userBExpenses = [
    { userId: "user-B", date: "2026-10-08", amount: 3500, type: "expense" }
  ]

  const trendA = getWeeklyTrendData(userAExpenses, { referenceDate: refThursday })
  const trendB = getWeeklyTrendData(userBExpenses, { referenceDate: refThursday })

  const thuA = trendA.find(d => d.dateKey === "2026-10-08")?.expense
  const thuB = trendB.find(d => d.dateKey === "2026-10-08")?.expense

  assert(thuA === 1500, `User A sees only User A expenses (1500, got ${thuA})`)
  assert(thuB === 3500, `User B sees only User B expenses (3500, got ${thuB})`)
}

// --- TEST 10: Date Labels Format ---
console.log("\n--- TEST 10: Compact Date Labels (e.g. Mon 5) ---")
{
  const trend = getWeeklyTrendData([], { referenceDate: refThursday })
  const labels = trend.map(d => d.date)
  const expectedLabels = ["Mon 5", "Tue 6", "Wed 7", "Thu 8", "Fri 9", "Sat 10", "Sun 11"]
  const allMatch = labels.every((l, idx) => l === expectedLabels[idx])
  assert(allMatch, `Labels match compact 'Day Date' format: ${labels.join(", ")}`)
}

console.log("\n========================================================")
console.log(`RESULTS: ${passed} passed, ${failed} failed`)
console.log("========================================================\n")

if (failed > 0) {
  process.exit(1)
}
