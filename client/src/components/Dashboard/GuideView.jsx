import { useState } from "react"
import { 
  Plus, 
  ArrowRight, 
  Receipt, 
  Wallet, 
  SlidersHorizontal, 
  PiggyBank, 
  Activity, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  Check,
  ChevronRight
} from "lucide-react"

export default function GuideView({
  onOpenAddModal,
  onOpenBudgets,
  onOpenSavingsGoals,
  onOpenOverview,
  onOpenAnalytics,
  onOpenCategoryEnvelopes,
  onCompleteOnboarding,
  isOnboarding = false
}) {
  const [completedSteps, setCompletedSteps] = useState(() => {
    try {
      const saved = localStorage.getItem("ledgerxl_quickstart_checklist")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const toggleStep = (stepNumber) => {
    setCompletedSteps((prev) => {
      const next = prev.includes(stepNumber)
        ? prev.filter((s) => s !== stepNumber)
        : [...prev, stepNumber]
      try {
        localStorage.setItem("ledgerxl_quickstart_checklist", JSON.stringify(next))
      } catch {
        // ignore storage errors
      }
      return next
    })
  }

  const steps = [
    {
      num: 1,
      badge: "Step 1",
      title: "Add Your Transactions",
      desc: "Record your income and expenses using New Transaction. Add the amount, category, date, and other details.",
      icon: Receipt,
      iconColor: "text-rose-500 dark:text-rose-400",
      iconBg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40",
      actionLabel: "+ New Transaction",
      action: onOpenAddModal
    },
    {
      num: 2,
      badge: "Step 2",
      title: "Track Your Money",
      desc: "Financial Overview shows your income, expenses, net balance, spending breakdown, and cash flow in one place.",
      icon: Wallet,
      iconColor: "text-blue-500 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/40",
      actionLabel: "View Overview",
      action: onOpenOverview
    },
    {
      num: 3,
      badge: "Step 3",
      title: "Set Your Budgets",
      desc: "Use Category Budgets to set monthly spending limits for categories like Food, Shopping, Bills, and Subscriptions.",
      icon: SlidersHorizontal,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40",
      actionLabel: "Set Budgets",
      action: onOpenBudgets
    },
    {
      num: 4,
      badge: "Step 4",
      title: "Set Savings Goals",
      desc: "Create savings targets for things you want to save for, set a target amount, and track your progress.",
      icon: PiggyBank,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40",
      actionLabel: "Create Goal",
      action: onOpenSavingsGoals
    },
    {
      num: 5,
      badge: "Step 5",
      title: "Understand Your Financial Health",
      desc: "Use Financial Health & Audit to get a quick picture of your savings, spending, cash flow, and overall financial health.",
      icon: Activity,
      iconColor: "text-indigo-500 dark:text-indigo-400",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/40",
      actionLabel: "Check Health",
      action: onOpenAnalytics
    }
  ]

  const whereCards = [
    {
      emoji: "💰",
      target: "Income / Expense",
      destination: "New Transaction",
      actionLabel: "Record Transaction",
      description: "Any money coming in or going out. Select income or expense, pick a category, and enter the amount.",
      action: onOpenAddModal,
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40"
    },
    {
      emoji: "🎯",
      target: "Monthly spending limit",
      destination: "Category Budgets",
      actionLabel: "Set Limits",
      description: "Cap your monthly spending on Food, Shopping, Bills, and more to keep your lifestyle in check.",
      action: onOpenCategoryEnvelopes || onOpenBudgets,
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40"
    },
    {
      emoji: "🏆",
      target: "Something you want to save for",
      destination: "Savings Goals",
      actionLabel: "Open Goals",
      description: "Save for an emergency fund, a vacation, a new laptop, or home renovation with visual progress bars.",
      action: onOpenSavingsGoals,
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40"
    },
    {
      emoji: "📊",
      target: '"Where is my money going?"',
      destination: "Spend Breakdown",
      actionLabel: "See Breakdown",
      description: "Interactive category charts showing your highest spending categories and monthly trends.",
      action: onOpenOverview,
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/40"
    },
    {
      emoji: "❤️",
      target: '"How healthy are my finances?"',
      destination: "Financial Health & Audit",
      actionLabel: "Audit Finances",
      description: "Instant A+ to F scoring with savings rate analysis, monthly burn metrics, and actionable tips.",
      action: onOpenAnalytics,
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40"
    }
  ]

  const checklistItems = [
    { id: 1, text: "Add your income.", action: onOpenAddModal, label: "Add Income" },
    { id: 2, text: "Add your recent expenses.", action: onOpenAddModal, label: "Add Expense" },
    { id: 3, text: "Set budgets for the categories you spend the most on.", action: onOpenCategoryEnvelopes || onOpenBudgets, label: "Set Budgets" },
    { id: 4, text: "Create a savings goal.", action: onOpenSavingsGoals, label: "Create Goal" },
    { id: 5, text: "Return to Financial Overview to understand your finances.", action: onCompleteOnboarding || onOpenOverview, label: "Go to Overview" }
  ]

  const completedCount = checklistItems.filter(item => completedSteps.includes(item.id)).length
  const progressPct = Math.round((completedCount / checklistItems.length) * 100)

  return (
    <div className="space-y-6 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-surface-1 border border-border-default rounded-xl p-6 sm:p-8 shadow-elevation-sm">
        {/* Subtle decorative gradient background */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-brand/5 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-subtle text-brand border border-brand/20 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Beginner&apos;s Guide • 2-Minute Read</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight leading-tight">
            Welcome to Ledger<span className="text-brand">XL</span>
          </h2>

          <p className="text-sm sm:text-base text-text-secondary mt-3 max-w-3xl leading-relaxed">
            Your simple financial dashboard to track spending, understand your cash flow, manage budgets, and work toward your savings goals.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-border-subtle">
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-hover active:bg-brand-active text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-brand/20 cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add First Transaction</span>
            </button>
            <button
              onClick={onCompleteOnboarding || onOpenOverview}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-2 hover:bg-surface-hover border border-border-default text-text-primary text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              <span>{isOnboarding ? "Get Started — Go to Dashboard" : "Explore Overview"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. HOW LEDGERXL WORKS — 5-STEP FLOW */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
            How LedgerXL Works
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            A simple 5-step flow from recording daily transactions to mastering your wealth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.num}
                className="bg-surface-1 border border-border-default hover:border-border-strong rounded-xl p-5 flex flex-col justify-between transition-all shadow-elevation-sm hover:shadow-elevation-md group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-2 border border-border-subtle text-text-muted">
                      {step.badge}
                    </span>
                    <div className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${step.iconBg}`}>
                      <Icon className={`h-4 w-4 ${step.iconColor}`} />
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-text-primary tracking-tight group-hover:text-brand transition-colors">
                    {step.title}
                  </h4>

                  <p className="text-xs text-text-secondary leading-relaxed mt-2">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border-subtle">
                  <button
                    onClick={step.action}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover hover:underline transition-colors cursor-pointer"
                  >
                    <span>{step.actionLabel}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 3. WHERE SHOULD I ADD WHAT? */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
            Where Should I Add What?
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Quick reference guide for beginners — click any card to jump straight to it
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {whereCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-surface-1 border border-border-default hover:border-border-strong rounded-xl p-5 flex flex-col justify-between transition-all shadow-elevation-sm hover:shadow-elevation-md group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-2xl shrink-0 p-1 bg-surface-2 rounded-lg border border-border-subtle inline-block">
                    {card.emoji}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border truncate max-w-[170px] ${card.badgeColor}`}>
                    {card.destination}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-text-primary tracking-tight leading-snug">
                  {card.target}
                </h4>

                <p className="text-[11px] sm:text-xs text-text-secondary mt-1.5 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle">
                <button
                  onClick={card.action}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-hover border border-border-subtle text-xs font-medium text-text-primary transition-colors cursor-pointer"
                >
                  <span>{card.actionLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-text-muted group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. QUICK START CHECKLIST */}
      <section className="bg-surface-1 border border-border-default rounded-xl p-5 sm:p-6 shadow-elevation-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                Quick Start
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              New to LedgerXL? Start here:
            </p>
          </div>

          {/* Checklist completion meter */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-xs font-semibold text-text-primary">
                {completedCount} of {checklistItems.length}
              </span>
              <span className="text-[11px] text-text-muted block">completed</span>
            </div>
            <div className="w-20 h-2 bg-surface-2 rounded-full overflow-hidden border border-border-subtle">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2.5">
          {checklistItems.map((item) => {
            const isDone = completedSteps.includes(item.id)
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 sm:px-4 rounded-xl border transition-all ${
                  isDone
                    ? "bg-surface-2/60 border-border-subtle"
                    : "bg-surface-1 border-border-default hover:border-border-strong hover:bg-surface-hover/30"
                }`}
              >
                <div 
                  className="flex items-center gap-3 min-w-0 cursor-pointer select-none flex-1 pr-2"
                  onClick={() => toggleStep(item.id)}
                >
                  <button
                    type="button"
                    className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      isDone
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                        : "border-border-strong hover:border-brand bg-surface-1"
                    }`}
                    aria-label={`Mark step ${item.id} complete`}
                  >
                    {isDone && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </button>

                  <span className={`text-xs sm:text-sm font-medium ${
                    isDone ? "line-through text-text-muted" : "text-text-primary"
                  }`}>
                    <span className="font-semibold text-text-muted mr-1.5">{item.id}.</span>
                    {item.text}
                  </span>
                </div>

                <button
                  onClick={item.action}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-brand hover:text-white bg-brand-subtle hover:bg-brand border border-brand/20 transition-all cursor-pointer shrink-0"
                >
                  {item.label}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* 5. GET STARTED / COMPLETION ACTION */}
      <section className="relative overflow-hidden bg-surface-1 border border-border-default hover:border-border-strong rounded-xl p-6 sm:p-8 shadow-elevation-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40 mb-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Ready to Begin</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
            Ready to take command of your finances?
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            You now know the essentials of LedgerXL. Jump straight into your personal Financial Overview to start tracking your cash flow, budgets, and savings.
          </p>
        </div>
        <div className="shrink-0 w-full sm:w-auto">
          <button
            onClick={onCompleteOnboarding || onOpenOverview}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover active:bg-brand-active text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-brand/25 cursor-pointer group"
          >
            <span>Go to My Dashboard</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* 6. SMALL DISCLAIMER / CLARITY */}
      <section className="p-4 sm:p-5 rounded-xl bg-surface-2/80 border border-border-subtle flex items-start gap-3 text-text-secondary text-xs leading-relaxed">
        <Info className="h-4 w-4 text-brand shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-text-primary text-xs">
            Important Clarity
          </p>
          <p className="text-[11px] sm:text-xs text-text-secondary">
            LedgerXL is a personal finance tracking and planning tool. It does not automatically manage or move the user&apos;s money.
          </p>
        </div>
      </section>
    </div>
  )
}
