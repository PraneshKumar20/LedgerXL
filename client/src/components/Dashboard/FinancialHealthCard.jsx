import { useMemo, useState } from "react"
import { formatNumber } from "../../utils/formatUtils"
import { Sparkles, Activity, ChevronDown } from "lucide-react"
import AnimatedCounter from "../ui/AnimatedCounter"

import { getGradeFromScore } from "../../utils/healthScoring"

export default function FinancialHealthCard({ 
  totalIncome, 
  totalExpense, 
  budgetLimit, 
  expenses = [], 
  currencySymbol = "₹" 
}) {
  const [showDetails, setShowDetails] = useState(false)

  // --- Intelligent Scoring Engine (PRESERVED & UNCHANGED) ---
  const { 
    totalScore, 
    healthTier,
    pillars, 
    recommendations 
  } = useMemo(() => {
    // 1. Savings Pillar (0 - 35 points)
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0
    let savingsScore = 0
    if (savingsRate >= 30) savingsScore = 35
    else if (savingsRate >= 20) savingsScore = 28
    else if (savingsRate >= 10) savingsScore = 20
    else if (savingsRate > 0) savingsScore = 12
    else savingsScore = 5

    // 2. Budget Adherence Pillar (0 - 30 points)
    const budgetUsage = budgetLimit > 0 ? (totalExpense / budgetLimit) * 100 : 100
    let budgetScore = 0
    if (budgetUsage <= 60) budgetScore = 30
    else if (budgetUsage <= 75) budgetScore = 25
    else if (budgetUsage <= 90) budgetScore = 18
    else if (budgetUsage <= 100) budgetScore = 10
    else budgetScore = 3

    // 3. Cashflow Stability Pillar (0 - 20 points)
    const hasSurplus = totalIncome > totalExpense
    const bufferRatio = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0
    let stabilityScore = 0
    if (hasSurplus && bufferRatio >= 0.25) stabilityScore = 20
    else if (hasSurplus) stabilityScore = 14
    else if (totalIncome === 0 && totalExpense === 0) stabilityScore = 10
    else stabilityScore = 4

    // 4. Fixed & Recurring Burden Pillar (0 - 15 points)
    const recurringExpense = Array.isArray(expenses)
      ? expenses.filter(e => e.isRecurring && e.type === 'expense').reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
      : 0
    const recurringRatio = totalExpense > 0 ? (recurringExpense / totalExpense) * 100 : 0
    let recurringScore = 0
    if (recurringRatio <= 20) recurringScore = 15
    else if (recurringRatio <= 35) recurringScore = 11
    else if (recurringRatio <= 50) recurringScore = 7
    else recurringScore = 3

    const finalScore = Math.min(100, Math.max(10, Math.round(savingsScore + budgetScore + stabilityScore + recurringScore)))

    // Grade & Tiering aligned with user rules: >80% Green, 60-80% Yellow, <60% Red
    const tier = getGradeFromScore(finalScore)

    const netSurplus = Math.max(0, totalIncome - totalExpense)

    const pillarList = [
      {
        name: "Savings Rate",
        scoreValue: totalIncome > 0 
          ? `${currencySymbol}${formatNumber(netSurplus, currencySymbol, 0, 0)}` 
          : `${savingsScore} pts`,
        targetValue: totalIncome > 0 
          ? <><span className="text-text-muted">of</span> <span className="font-semibold text-text-primary">{currencySymbol}{formatNumber(totalIncome, currencySymbol, 0, 0)}</span></>
          : <><span className="text-text-muted">of</span> <span className="font-semibold text-text-primary">35 max</span></>,
        percent: Math.min(100, Math.max(0, savingsRate || (savingsScore / 35) * 100)),
        detail: `${savingsRate.toFixed(0)}% of income saved`,
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
        dotBg: "bg-emerald-500 dark:bg-emerald-400",
        barGradient: "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400",
        statusDot: "bg-emerald-500 dark:bg-emerald-400",
        statusLabel: savingsScore >= 28 ? "Optimal" : "Pacing",
        statusTextClass: savingsScore >= 28 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
      },
      {
        name: "Budget Used",
        scoreValue: budgetLimit > 0 
          ? `${currencySymbol}${formatNumber(totalExpense, currencySymbol, 0, 0)}` 
          : `${budgetScore} pts`,
        targetValue: budgetLimit > 0 
          ? <><span className="text-text-muted">of</span> <span className="font-semibold text-text-primary">{currencySymbol}{formatNumber(budgetLimit, currencySymbol, 0, 0)}</span></>
          : <><span className="text-text-muted">of</span> <span className="font-semibold text-text-primary">30 max</span></>,
        percent: Math.min(100, Math.max(0, budgetUsage)),
        detail: `${Math.round(budgetUsage)}% of budget used`,
        badgeClass: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
        dotBg: "bg-sky-500 dark:bg-sky-400",
        barGradient: "bg-gradient-to-r from-sky-600 via-blue-500 to-cyan-400",
        statusDot: budgetScore >= 25 ? "bg-sky-500 dark:bg-sky-400" : "bg-amber-500 dark:bg-amber-400",
        statusLabel: budgetScore >= 25 ? "Within Limit" : budgetScore >= 18 ? "Moderate" : "Over Budget",
        statusTextClass: budgetScore >= 25 ? "text-sky-600 dark:text-sky-400" : budgetScore >= 18 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
      },
      {
        name: "Cash Flow Balance",
        scoreValue: totalIncome > 0 || totalExpense > 0 
          ? `${currencySymbol}${formatNumber(Math.abs(totalIncome - totalExpense), currencySymbol, 0, 0)}` 
          : `${stabilityScore} pts`,
        targetValue: totalIncome > 0 || totalExpense > 0 
          ? <><span className="text-text-muted">net</span> <span className="font-semibold text-text-primary">{totalIncome >= totalExpense ? "net savings" : "overspent"}</span></>
          : <><span className="text-text-muted">of</span> <span className="font-semibold text-text-primary">20 max</span></>,
        percent: Math.min(100, Math.max(10, (stabilityScore / 20) * 100)),
        detail: hasSurplus ? "Cash Flow Positive" : "Expenses Exceeded Income",
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
        dotBg: "bg-indigo-500 dark:bg-indigo-400",
        barGradient: "bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400",
        statusDot: hasSurplus ? "bg-emerald-500 dark:bg-emerald-400" : "bg-rose-500 dark:bg-rose-400",
        statusLabel: hasSurplus ? "Positive Flow" : "Overspent",
        statusTextClass: hasSurplus ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
      },
      {
        name: "Recurring Bills",
        scoreValue: `${currencySymbol}${formatNumber(recurringExpense, currencySymbol, 0, 0)}`,
        targetValue: <><span className="text-text-muted">of</span> <span className="font-semibold text-text-primary">{currencySymbol}{formatNumber(totalExpense, currencySymbol, 0, 0)}</span></>,
        percent: Math.min(100, Math.max(0, recurringRatio)),
        detail: `${recurringRatio.toFixed(0)}% of spending on bills`,
        badgeClass: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
        dotBg: "bg-amber-500 dark:bg-amber-400",
        barGradient: "bg-gradient-to-r from-amber-600 via-orange-500 to-amber-400",
        statusDot: recurringScore >= 11 ? "bg-brand" : "bg-amber-500 dark:bg-amber-400",
        statusLabel: recurringScore >= 11 ? "Manageable Bills" : "High Recurring Costs",
        statusTextClass: recurringScore >= 11 ? "text-brand" : "text-amber-600 dark:text-amber-400"
      }
    ]

    // Actionable Recommendations
    const recs = []
    if (recurringRatio > 35) {
      recs.push({
        title: "Review Subscriptions",
        category: "Recurring Bills",
        desc: "Fixed recurring charges take up more than 35% of spending. Review unused subscriptions in Bill Radar.",
        potentialSaving: `${currencySymbol}30-80/mo`,
        emoji: "📡",
        impact: "Lower Recurring Costs"
      })
    }
    if (budgetUsage > 85) {
      recs.push({
        title: "Pace Discretionary Spend",
        category: "Budget Limit",
        desc: "You have spent over 85% of your planned monthly budget limit. Consider limiting dining and shopping.",
        potentialSaving: `${currencySymbol}100-200`,
        emoji: "⚠️",
        impact: "Budget Safety"
      })
    }
    if (savingsRate >= 25) {
      recs.push({
        title: "High Savings Optimization",
        category: "Wealth Accelerator",
        desc: "Your savings rate exceeds the benchmark 20%. Allocate recurring savings into dedicated savings targets.",
        potentialSaving: "Wealth Compounder",
        emoji: "💎",
        impact: "Growth"
      })
    } else {
      recs.push({
        title: "Boost Emergency Runway",
        category: "Capital Reserve",
        desc: "Aiming for a 20% savings target creates a comfortable savings cushion against unexpected expenses.",
        potentialSaving: `${currencySymbol}150+/mo`,
        emoji: "🛡️",
        impact: "Security"
      })
    }

    return {
      totalScore: finalScore,
      healthTier: tier,
      pillars: pillarList,
      recommendations: recs.slice(0, 3)
    }
  }, [totalIncome, totalExpense, budgetLimit, expenses, currencySymbol])

  const topRec = recommendations[0]

  return (
    <div className="bg-surface-1 border border-border-default rounded-xl p-5 sm:p-6 shadow-elevation-sm space-y-5">
      {/* LEVEL 1 — Identity Header */}
      <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Activity className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary tracking-tight">
              Financial Health
            </h3>
            <span className="text-xs font-mono text-text-muted hidden sm:inline">
              · 4 pillars
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors px-2.5 py-1 rounded-md hover:bg-surface-2"
        >
          <span>{showDetails ? "Hide Details" : "Details"}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* LEVEL 2 & 3 — Main Result & Supporting Context (Two-sided Hero Row) */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left Side: Score + Grade + Verdict + Integrated Description */}
        <div className="space-y-2">
          {/* Score & Grade */}
          <div className="flex items-baseline gap-3">
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary leading-none">
                <AnimatedCounter value={totalScore} decimals={0} />
              </span>
              <span className="text-sm font-semibold text-text-muted">
                / 100
              </span>
            </div>

            <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold font-mono tracking-wide ${healthTier.badgeClass}`}>
              Grade {healthTier.grade}
            </span>
          </div>

          {/* Verdict + Integrated Description */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${healthTier.dotColor} shrink-0`} />
              <h4 className="text-sm sm:text-base font-semibold text-text-primary tracking-tight">
                {healthTier.title}
              </h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed max-w-xl">
              {healthTier.desc}
            </p>
          </div>
        </div>

        {/* Right Side: Tertiary Metadata (Muted & secondary) */}
        <div className="flex items-center gap-2 text-xs font-mono text-text-muted sm:pt-1 shrink-0">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {healthTier.statusText}
          </span>
          <span>·</span>
          <span>4 Pillars</span>
        </div>
      </div>

      {/* LEVEL 4A — Supporting Visualization: Health Progress */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-text-secondary font-medium">Health Progress</span>
          <span className="font-bold text-text-primary">{totalScore} / 100</span>
        </div>

        {/* Thin progress track */}
        <div className="relative h-2 w-full bg-slate-200 dark:bg-slate-900 border border-border-subtle rounded-full overflow-hidden">
          {/* Subtle ticks at 60% and 80% */}
          <div className="absolute inset-0 pointer-events-none z-10 flex">
            <div className="w-[60%] h-full border-r border-border-default/60" />
            <div className="w-[20%] h-full border-r border-border-default/60" />
          </div>

          <div
            style={{ width: `${totalScore}%` }}
            className={`h-full rounded-full transition-all duration-700 ${healthTier.barGradient}`}
          />
        </div>

        {/* Compact Tier Range Markers */}
        <div className="grid grid-cols-3 text-[10px] font-mono text-text-muted pt-0.5">
          <div className="text-left">
            <span className={totalScore < 60 ? "text-rose-500 dark:text-rose-400 font-semibold" : "text-text-muted"}>
              &lt;60% Critical
            </span>
          </div>
          <div className="text-center">
            <span className={totalScore >= 60 && totalScore <= 80 ? "text-amber-500 dark:text-amber-400 font-semibold" : "text-text-muted"}>
              60%–80% Fair
            </span>
          </div>
          <div className="text-right">
            <span className={totalScore > 80 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-text-muted"}>
              &gt;80% Optimal
            </span>
          </div>
        </div>
      </div>

      {/* LEVEL 4B — Integrated Actionable Recommendation */}
      {topRec && (
        <div className="pt-4 border-t border-border-subtle/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                Recommendation
              </span>
            </div>
            <span className="text-[11px] font-mono text-text-muted">
              {recommendations.length} insight{recommendations.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <h5 className="text-xs sm:text-sm font-semibold text-text-primary tracking-tight">
              {topRec.title}
            </h5>
            <span className="self-start sm:self-auto text-[10px] font-medium font-mono px-2 py-0.5 rounded bg-surface-2 text-text-secondary border border-border-subtle">
              {topRec.category}
            </span>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
            {topRec.desc}
          </p>
        </div>
      )}

      {/* Details Breakdown (Toggled via Header 'Details' action) */}
      {showDetails && (
        <div className="pt-4 border-t border-border-subtle space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary font-mono">
              Scoring Pillars Breakdown
            </span>
            <span className="text-xs font-mono text-text-muted">
              4 Dimensions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.name}
                className="p-3.5 rounded-lg bg-surface-2/40 border border-border-subtle space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded border ${pillar.badgeClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${pillar.dotBg}`} />
                    <span>{pillar.name}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-text-primary">
                    {pillar.percent.toFixed(0)}%
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline gap-1">
                    <span className="text-base font-bold text-text-primary font-mono tracking-tight leading-none truncate">
                      {pillar.scoreValue}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted shrink-0">
                      {pillar.targetValue}
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-surface-inset border border-border-subtle rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full opacity-90 ${pillar.barGradient}`}
                      style={{ width: `${pillar.percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-[11px] font-mono">
                  <span className="text-text-muted truncate max-w-[120px]">
                    {pillar.detail}
                  </span>
                  <span className={`font-semibold shrink-0 ${pillar.statusTextClass}`}>
                    {pillar.statusLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
