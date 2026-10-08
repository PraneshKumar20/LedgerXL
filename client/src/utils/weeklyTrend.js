/**
 * weeklyTrend.js
 * Centralized utility to generate dynamic, 7-day calendar week spending trend data (Monday -> Sunday).
 * Derives data from actual transaction records for the current week without hardcoded demo ranges.
 */

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

/**
 * Normalizes any transaction date (string, Date, or ISO timestamp) into
 * a canonical calendar date string "YYYY-MM-DD" in local time, guarding
 * against UTC-offset shifts.
 *
 * @param {string|Date|number} dateVal
 * @returns {string} "YYYY-MM-DD" or "" if invalid
 */
export function getCalendarDateKey(dateVal) {
  if (!dateVal) return ""

  if (typeof dateVal === "string") {
    const match = dateVal.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
      // In LedgerXL, HTML date inputs store "YYYY-MM-DD", which MongoDB serializes
      // as "YYYY-MM-DDT00:00:00.000Z" or "YYYY-MM-DD".
      // Preserving this exact date component prevents UTC midnight from shifting
      // into the previous day in western timezones.
      if (!dateVal.includes("T") || dateVal.endsWith("T00:00:00.000Z") || dateVal.endsWith("T00:00:00Z")) {
        return `${match[1]}-${match[2]}-${match[3]}`
      }
      // If a full timestamp with non-zero time is provided, evaluate in local time
      const d = new Date(dateVal)
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, "0")
        const day = String(d.getDate()).padStart(2, "0")
        return `${y}-${m}-${day}`
      }
      return `${match[1]}-${match[2]}-${match[3]}`
    }
  }

  const d = dateVal instanceof Date ? dateVal : new Date(dateVal)
  if (isNaN(d.getTime())) return ""
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/**
 * Returns the Monday Date object (at local 00:00:00) for the calendar week
 * containing referenceDate.
 *
 * Calendar-week model: MONDAY -> SUNDAY
 * - Monday: day 1 -> diff = 0
 * - Tuesday: day 2 -> diff = 1
 * - ...
 * - Saturday: day 6 -> diff = 5
 * - Sunday: day 0 -> diff = 6
 *
 * @param {Date|string|number} [referenceDate=new Date()]
 * @returns {Date} Monday Date object at 00:00:00 local time
 */
export function getStartOfWeekMonday(referenceDate = new Date()) {
  const d = referenceDate instanceof Date ? new Date(referenceDate) : new Date(referenceDate)
  const localDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
  const dayOfWeek = localDate.getDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  localDate.setDate(localDate.getDate() - diffToMonday)
  return localDate
}

/**
 * Generates the 7 days of the current calendar week (Monday through Sunday)
 * and aggregates actual user transactions into daily expense and income totals.
 *
 * Requirements:
 * - Exactly 7 days returned.
 * - Monday is day 0, Sunday is day 6.
 * - Outgoing expenses (type === 'expense' or untyped) are summed into `expense`.
 * - Income transactions (type === 'income') are excluded from `expense` and summed into `income`.
 * - Days with zero transactions are preserved with 0 values.
 * - Labels follow the compact format: "Mon 5", "Tue 6", "Wed 7", etc.
 *
 * @param {Array<Object>} transactions - User's transaction records
 * @param {Object} [options]
 * @param {Date|string|number} [options.referenceDate=new Date()] - Reference date for current week
 * @param {number} [options.multiplier=1] - Currency multiplier (applied if transactions are unscaled)
 * @returns {Array<Object>} Array of exactly 7 daily trend objects
 */
export function getWeeklyTrendData(transactions = [], options = {}) {
  const { referenceDate = new Date(), multiplier = 1 } = options
  const monday = getStartOfWeekMonday(referenceDate)

  const days = []
  const dayMap = {}

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday)
    dayDate.setDate(monday.getDate() + i)

    const y = dayDate.getFullYear()
    const m = String(dayDate.getMonth() + 1).padStart(2, "0")
    const d = String(dayDate.getDate()).padStart(2, "0")
    const dateKey = `${y}-${m}-${d}`

    const dayName = DAY_NAMES[dayDate.getDay()]
    const dayNumber = dayDate.getDate()
    const label = `${dayName} ${dayNumber}`

    const dayObj = {
      key: dateKey,
      dateKey,
      date: label, // used by Recharts XAxis dataKey="date"
      dayName,
      dayNumber,
      expense: 0,
      income: 0
    }

    days.push(dayObj)
    dayMap[dateKey] = dayObj
  }

  if (Array.isArray(transactions)) {
    for (const tx of transactions) {
      if (!tx || !tx.date) continue

      const txDateKey = getCalendarDateKey(tx.date)
      if (dayMap[txDateKey]) {
        const rawAmount = Number(tx.amount) || 0
        const amount = multiplier === 1 ? rawAmount : rawAmount * multiplier

        if (tx.type === "expense" || !tx.type) {
          dayMap[txDateKey].expense += amount
        } else if (tx.type === "income") {
          dayMap[txDateKey].income += amount
        }
      }
    }
  }

  // Round amounts to 2 decimal places to avoid floating point inaccuracies
  days.forEach((day) => {
    day.expense = Math.round(day.expense * 100) / 100
    day.income = Math.round(day.income * 100) / 100
  })

  return days
}
