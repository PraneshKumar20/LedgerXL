import { useMemo } from "react"
import { formatNumber } from "../../utils/formatUtils"
import { Award, Sparkles, Activity, ShieldCheck } from "lucide-react"
import AnimatedCounter from "../ui/AnimatedCounter"

import { getGradeFromScore } from "../../utils/healthScoring"

export default function FinancialHealthCard({ 
  totalIncome, 
  totalExpense, 
  budgetLimit, 
  expenses = [], 
  currencySymbol = "₹" 
}) {
  // --- Intelligent Scoring Engine ---
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
        name: "Savings Ratio",
        scoreValue: totalIncome > 0 
          ? `${currencySymbol}${formatNumber(netSurplus, currencySymbol, 0, 0)}` 
          : `${savingsScore} pts`,
        targetValue: totalIncome > 0 
          ? <><span className="text-text-muted">of</span> <span className="font-semibold text-text-primary">{currencySymbol}{formatNumber(totalIncome, currencySymbol, 0, 0)}</span></>
          : <><span className="text-text-muted">of</span> <span className="font-semibold text-text-primary">35 max</span></>,
        percent: Math.min(100, Math.max(0, savingsRate || (savingsScore / 35) * 100)),
        detail: `${savingsRate.toFixed(0)}% retained`,
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
        dotBg: "bg-emerald-500 dark:bg-emerald-400",
        barGradient: "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400",
        statusDot: "bg-emerald-500 dark:bg-emerald-400",
        statusLabel: savingsScore >= 28 ? "Optimal" : "Pacing",
        statusTextClass: savingsScore >= 28 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
      },
      {
        name: "Budget Buffer",
        scoreValue: budgetLimit > 0 
          ? `${currencySymbol}${formatNumber(totalExpense, currencySymbol, 0, 0)}` 
          : `${budgetScore} pts`,
        targetValue: budgetLimit > 0 
          ? <><span className="text-text-muted">of</span> <span className="font-semibold text-text-primary">{currencySymbol}{formatNumber(budgetLimit, currencySymbol, 0, 0)}</span></>
          : <><span className="text-text-muted">of</span> <span className="font-semibold text-text-primary">30 max</span></>,
        percent: Math.min(100, Math.max(0, budgetUsage)),
        detail: `${Math.max(0, Math.round(100 - budgetUsage))}% headroom`,
        badgeClass: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
        dotBg: "bg-sky-500 dark:bg-sky-400",
        barGradient: "bg-gradient-to-r from-sky-600 via-blue-500 to-cyan-400",
        statusDot: budgetScore >= 25 ? "bg-sky-500 dark:bg-sky-400" : "bg-amber-500 dark:bg-amber-400",
        statusLabel: budgetScore >= 25 ? "Safe Limit" : budgetScore >= 18 ? "Moderate" : "Tight",
        statusTextClass: budgetScore >= 25 ? "text-sky-600 dark:text-sky-400" : budgetScore >= 18 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
      },
      {
        name: "Cashflow Buffer",
        scoreValue: totalIncome > 0 || totalExpense > 0 
          ? `${currencySymbol}${formatNumber(Math.abs(totalIncome - totalExpense), currencySymbol, 0, 0)}` 
          : `${stabilityScore} pts`,
        targetValue: totalIncome > 0 || totalExpense > 0 
          ? <><span className="text-text-muted">net</span> <span className="font-semibold text-text-primary">{totalIncome >= totalExpense ? "surplus" : "deficit"}</span></>
          : <><span className="text-text-muted">of</span> <span className="font-semibold text-text-primary">20 max</span></>,
        percent: Math.min(100, Math.max(10, (stabilityScore / 20) * 100)),
        detail: hasSurplus ? "Cashflow Positive" : "Deficit Warning",
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
        dotBg: "bg-indigo-500 dark:bg-indigo-400",
        barGradient: "bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400",
        statusDot: hasSurplus ? "bg-emerald-500 dark:bg-emerald-400" : "bg-rose-500 dark:bg-rose-400",
        statusLabel: hasSurplus ? "Stable" : "Deficit",
        statusTextClass: hasSurplus ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
      },
      {
        name: "Fixed Burden",
        scoreValue: `${currencySymbol}${formatNumber(recurringExpense, currencySymbol, 0, 0)}`,
        targetValue: <><span className="text-text-muted">of</span> <span className="font-semibold text-text-primary">{currencySymbol}{formatNumber(totalExpense, currencySymbol, 0, 0)}</span></>,
        percent: Math.min(100, Math.max(0, recurringRatio)),
        detail: `${recurringRatio.toFixed(0)}% recurring`,
        badgeClass: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
        dotBg: "bg-amber-500 dark:bg-amber-400",
        barGradient: "bg-gradient-to-r from-amber-600 via-orange-500 to-amber-400",
        statusDot: recurringScore >= 11 ? "bg-brand" : "bg-amber-500 dark:bg-amber-400",
        statusLabel: recurringScore >= 11 ? "Low Burden" : "High Burn",
        statusTextClass: recurringScore >= 11 ? "text-brand" : "text-amber-600 dark:text-amber-400"
      }
    ]

    // Actionable Recommendations matching luxury card style
    const recs = []
    if (recurringRatio > 35) {
      recs.push({
        title: "Audit Subscriptions",
        category: "Recurring Liabilities",
        desc: "Fixed recurring charges take up more than 35% of outflows. Audit unused subscriptions in Bill Radar.",
        potentialSaving: `${currencySymbol}30-80/mo`,
        emoji: "📡",
        impact: "Lower Burn"
      })
    }
    if (budgetUsage > 85) {
      recs.push({
        title: "Pace Discretionary Spend",
        category: "Budget Threshold",
        desc: "You have utilized over 85% of your planned monthly budget limit. Consider limiting dining and shopping.",
        potentialSaving: `${currencySymbol}100-200`,
        emoji: "⚠️",
        impact: "Budget Safety"
      })
    }
    if (savingsRate >= 25) {
      recs.push({
        title: "High Savings Optimization",
        category: "Wealth Accelerator",
        desc: "Your savings rate exceeds the benchmark 20%. Allocate recurring surplus into dedicated savings targets.",
        potentialSaving: "Wealth Compounder",
        emoji: "💎",
        impact: "Growth"
      })
    } else {
      recs.push({
        title: "Boost Emergency Runway",
        category: "Capital Reserve",
        desc: "Aiming for a 20% savings target creates a comfortable living buffer against unexpected outlays.",
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

  return (
    <div className="bg-surface-1 border border-border-default rounded-xl p-5 sm:p-6 lg:p-7 shadow-elevation-sm space-y-6 md:space-y-8">
      {/* 1. Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
        <div>
          <h2 className="text-[19px] font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            <span>4-Pillar Financial Health Audit</span>
          </h2>
          <p className="text-xs text-text-secondary font-normal mt-0.5">
            Algorithmic scoring across savings rate, budget adherence, cashflow buffer, and recurring burden
          </p>
        </div>
      </div>

      {/* 2. Hero Financial Health Score Showcase with Master Health Bar */}
      <div className="rounded-xl bg-gradient-to-b from-surface-2 to-surface-inset border border-border-subtle p-5 sm:p-6 lg:p-7 shadow-elevation-md space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Score number + Grade + Verdict */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-secondary flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-brand" />
                <span>Financial Health Score</span>
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-text-primary leading-none">
                <AnimatedCounter value={totalScore} decimals={0} />
              </span>
              <span className="text-base sm:text-lg font-mono text-text-muted font-semibold">
                / 100
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold font-mono tracking-wide ${healthTier.badgeClass}`}>
                Grade {healthTier.grade}
              </span>
            </div>

            <div className="space-y-0.5">
              <h3 className="text-sm sm:text-base font-bold text-text-primary tracking-tight flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${healthTier.dotColor} animate-pulse shadow-[0_0_8px_currentColor]`} />
                <span>{healthTier.title}</span>
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary max-w-xl leading-relaxed">
                {healthTier.desc}
              </p>
            </div>
          </div>

          {/* Right Side: Quick Stats / Bracket Summary */}
          <div className="grid grid-cols-2 gap-3 min-w-[280px] lg:min-w-[320px] bg-background/70 p-4 rounded-xl border border-border-subtle">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Health Bracket</span>
              <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" />
                <span>{healthTier.statusText}</span>
              </p>
              <p className="text-[11px] text-text-muted">Real-time audit</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Scoring Pillars</span>
              <p className="text-sm font-bold font-mono text-text-primary">4 Dimensions</p>
              <p className="text-[11px] text-text-muted">Savings, Budget, Flow, Debt</p>
            </div>
          </div>
        </div>

        {/* Master Health Bar with Tier Zones */}
        <div className="space-y-2.5 pt-4 border-t border-border-subtle">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-text-primary font-semibold flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${healthTier.dotColor}`} />
              <span>Health Meter & Progress</span>
            </span>
            <span className="font-bold text-text-primary">
              {totalScore}% Capacity
            </span>
          </div>

          {/* Progress Track */}
          <div className="relative h-3 w-full bg-slate-200 dark:bg-slate-950 border border-border-subtle rounded-full overflow-hidden p-[1px] shadow-inner">
            {/* Ticks at 60% and 80% */}
            <div className="absolute inset-0 pointer-events-none z-10 flex">
              <div className="w-[60%] h-full border-r border-border-default/60" />
              <div className="w-[20%] h-full border-r border-border-default/60" />
            </div>

            <div
              style={{ width: `${totalScore}%` }}
              className={`h-full rounded-full transition-all duration-700 ${healthTier.barGradient}`}
            />
          </div>

          {/* Tier Range Markers matching exact user rules */}
          <div className="grid grid-cols-3 text-[10px] sm:text-[11px] font-mono text-text-muted">
            <div className="text-left">
              <span className={totalScore < 60 ? "text-rose-400 font-bold" : "text-text-muted"}>
                &lt;60% Red (Critical)
              </span>
            </div>
            <div className="text-center">
              <span className={totalScore >= 60 && totalScore <= 80 ? "text-amber-400 font-bold" : "text-text-muted"}>
                60%–80% Yellow (Fair)
              </span>
            </div>
            <div className="text-right">
              <span className={totalScore > 80 ? "text-emerald-400 font-bold" : "text-text-muted"}>
                &gt;80% Green (Optimal)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recommendation Section */}
      {recommendations.length > 0 && (
        <div className="rounded-xl bg-gradient-to-b from-surface-2 to-surface-inset border border-border-subtle p-4 sm:p-5 lg:p-6 space-y-4 shadow-elevation-sm">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" />
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Recommendation
              </span>
            </div>
            <span className="text-[11px] font-mono text-text-secondary">
              {recommendations.length} insight{recommendations.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl shrink-0">
                      {rec.emoji}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-text-primary tracking-tight">
                      {rec.title}
                    </h3>
                  </div>
                  <span className="self-start sm:self-auto text-[11px] font-semibold font-mono px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500/25 dark:border-emerald-800/40">
                    {rec.category}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-text-primary leading-relaxed sm:pl-[52px]">
                  {rec.desc}
                </p>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-border-default/70 sm:ml-[52px] font-mono">
                  <span className="text-text-secondary">
                    Impact: <span className="font-semibold text-text-primary">{rec.impact}</span>
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 inline-block animate-pulse" />
                    <span>Active Advice</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. 4 Health Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {pillars.map((pillar) => (
          <div
            key={pillar.name}
            className="p-4 sm:p-5 rounded-xl bg-surface-1 border border-border-default hover:border-border-strong transition-all duration-200 space-y-3.5 group hover:shadow-elevation-sm dark:hover:shadow-black/20"
          >
            {/* Header: Pillar Badge with colored dot + Percentage */}
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded border ${pillar.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${pillar.dotBg}`} />
                <span>{pillar.name}</span>
              </span>
              <span className="text-[13px] font-mono font-bold text-text-primary">
                {pillar.percent.toFixed(0)}%
              </span>
            </div>

            {/* Amount & Target Row */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline pt-0.5 gap-2">
                <span className="text-[20px] font-bold text-text-primary font-mono tracking-tight leading-none truncate">
                  {pillar.scoreValue}
                </span>
                <span className="text-[11px] font-mono text-text-muted shrink-0">
                  {pillar.targetValue}
                </span>
              </div>

              {/* High fidelity progress bar */}
              <div className="h-1.5 w-full bg-surface-inset border border-border-subtle rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-500 opacity-90 ${pillar.barGradient}`}
                  style={{ width: `${pillar.percent}%` }}
                />
              </div>
            </div>

            {/* Bottom Row: Detail + Status */}
            <div className="flex items-center justify-between pt-3 border-t border-border-default/70 text-xs font-mono">
              <span className="text-text-muted">
                {pillar.detail}
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${pillar.statusDot}`} />
                <span className={`font-semibold ${pillar.statusTextClass}`}>
                  {pillar.statusLabel}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
