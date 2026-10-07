import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import confetti from "canvas-confetti"
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
  ChevronRight,
  TrendingUp,
  Radio,
  Repeat,
  PartyPopper
} from "lucide-react"

export default function GuideView({
  onOpenAddModal,
  onOpenTransactions,
  onOpenBudgets,
  onOpenSavingsGoals,
  onOpenSubscriptions,
  onOpenOverview,
  onOpenAnalytics,
  onOpenCategoryEnvelopes,
  onCompleteOnboarding,
  isOnboarding = false,
  hasIncome = false,
  hasExpense = false,
  hasBudgets = false,
  hasGoals = false,
  hasSubscriptions = false,
  userStorageKey = "guest"
}) {
  const checklistStorageKey = `ledgerxl_quickstart_checklist_${userStorageKey}`
  const celebrationStorageKey = `ledgerxl_quickstart_celebrated_${userStorageKey}`

  // Manual completed checklist items state
  const [manualCompleted, setManualCompleted] = useState(() => {
    try {
      const saved = localStorage.getItem(checklistStorageKey) || localStorage.getItem("ledgerxl_quickstart_checklist")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Refs to track celebration lifecycle without causing cascading re-renders
  const celebrationTimersRef = useRef([])
  const prevCompletedCountRef = useRef(null)
  const isInitialMountRef = useRef(true)

  const toggleStep = (stepNumber) => {
    setManualCompleted((prev) => {
      const next = prev.includes(stepNumber)
        ? prev.filter((s) => s !== stepNumber)
        : [...prev, stepNumber]
      try {
        localStorage.setItem(checklistStorageKey, JSON.stringify(next))
      } catch {
        // ignore storage errors
      }
      return next
    })
  }

  // 1. Where Should I Add What? (Fast Action Finder)
  const whereToAddItems = [
    {
      emoji: "💰",
      intent: "I want to add income or an expense",
      destination: "Transactions Ledger",
      summary: "Log your salary, freelance earnings, daily spending, or bills.",
      actionLabel: "Add a Transaction",
      action: onOpenAddModal,
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40"
    },
    {
      emoji: "📊",
      intent: "I want to see where my money goes",
      destination: "Analytics & Insights",
      summary: "Discover category breakdown trends and monthly spending trajectories.",
      actionLabel: "Review Your Spending",
      action: onOpenAnalytics,
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/40"
    },
    {
      emoji: "🎯",
      intent: "I want to limit my spending",
      destination: "Category Budgets",
      summary: "Cap monthly spending on Food, Shopping, Bills, and other categories.",
      actionLabel: "Set a Budget",
      action: onOpenCategoryEnvelopes || onOpenBudgets,
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40"
    },
    {
      emoji: "🏆",
      intent: "I want to save for something",
      destination: "Savings Goals",
      summary: "Plan dedicated targets for an emergency fund, vacation, or new tech.",
      actionLabel: "Create a Savings Goal",
      action: onOpenSavingsGoals,
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40"
    },
    {
      emoji: "🔄",
      intent: "I want to track subscriptions",
      destination: "Bill Radar",
      summary: "Monitor recurring bills, annual costs, and upcoming renewal alerts.",
      actionLabel: "Check Your Subscriptions",
      action: onOpenSubscriptions,
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/40"
    },
    {
      emoji: "❤️",
      intent: "I want to understand my finances",
      destination: "Financial Health",
      summary: "Check your overall financial grade, savings rate, and cash runway.",
      actionLabel: "View Financial Health",
      action: onOpenOverview,
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40"
    }
  ]

  // 2. 6 Core Sections with 10-15s Scannable Mental Models
  const coreSections = [
    {
      id: "overview",
      badge: "Command Center",
      title: "1. Financial Overview",
      purpose: "See your overall financial position in one place.",
      whenToUse: "Daily or weekly home base to check your net cash balance and cash flow.",
      icon: Wallet,
      iconColor: "text-blue-500 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/40",
      chips: [
        { label: "Income", note: "Money coming in" },
        { label: "Expenses", note: "Money going out" },
        { label: "Net Balance", note: "Income minus expenses" },
        { label: "Spend Breakdown", note: "Where your money is going" },
        { label: "Cash Flow", note: "Money in vs. money out over time" },
        { label: "Financial Health", note: "Quick snapshot of your financial position" }
      ],
      actionLabel: "View Financial Overview",
      action: onOpenOverview
    },
    {
      id: "transactions",
      badge: "The Foundation",
      title: "2. Transactions Ledger",
      purpose: "Record the money coming in and going out.",
      whenToUse: "Whenever you make a purchase, receive pay, or review your historical line items.",
      icon: Receipt,
      iconColor: "text-rose-500 dark:text-rose-400",
      iconBg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40",
      chips: [
        { label: "Income (+)", note: "Money you receive (Salary, Client payout)" },
        { label: "Expense (-)", note: "Money you spend (Groceries, Dining, Rent)" },
        { label: "Category", note: "What the money was spent on (Food, Bills, Shopping)" },
        { label: "Date", note: "When the transaction happened" },
        { label: "Recurring", note: "Repeating bills or subscriptions (Netflix, Rent, Gym)" }
      ],
      actionLabel: "Add a Transaction",
      action: onOpenAddModal,
      secondaryLabel: "View Transactions Ledger",
      secondaryAction: onOpenTransactions
    },
    {
      id: "analytics",
      badge: "Spending Insights",
      title: "3. Analytics & Insights",
      purpose: "Understand where your money goes and how your spending changes.",
      whenToUse: "When you want to review spending patterns and spot lifestyle trends.",
      icon: TrendingUp,
      iconColor: "text-indigo-500 dark:text-indigo-400",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/40",
      chips: [
        { label: "Top Spending Categories", note: "Where your biggest money goes" },
        { label: "Spending Trends", note: "Month-over-month trajectory" },
        { label: "Income vs. Expenses", note: "Total money made vs. total spent" },
        { label: "Useful Insights", note: "Actionable observations on spikes" }
      ],
      actionLabel: "Review Your Spending",
      action: onOpenAnalytics
    },
    {
      id: "budgets-goals",
      badge: "Control & Plan",
      title: "4. Budgets & Savings Goals",
      purpose: "Control spending and plan what you're saving for.",
      whenToUse: "Set category budgets at the start of the month; add savings goals whenever planning ahead.",
      icon: SlidersHorizontal,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40",
      twoCards: [
        {
          tag: "CONTROL SPENDING",
          title: "Category Budgets",
          tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40",
          desc: "Limit how much you want to spend each month.",
          example: "e.g., Food → ₹5,000/month • Shopping → ₹3,000/month",
          shows: "Visual envelopes reveal remaining budget so you don't overspend.",
          actionLabel: "Set a Budget",
          action: onOpenCategoryEnvelopes || onOpenBudgets
        },
        {
          tag: "PLAN SAVINGS",
          title: "Savings Goals",
          tagColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
          desc: "Plan how much you want to save for something special.",
          example: "e.g., Emergency Fund → ₹50,000 • New Laptop → ₹80,000",
          shows: "Visual progress bars track your target dates and remaining needed amounts.",
          actionLabel: "Create a Savings Goal",
          action: onOpenSavingsGoals
        }
      ]
    },
    {
      id: "subscriptions",
      badge: "Bill Protection",
      title: "5. Bill Radar",
      purpose: "Track recurring bills and subscriptions.",
      whenToUse: "To review ongoing commitments, track renewal dates, and eliminate waste.",
      icon: Radio,
      iconColor: "text-purple-500 dark:text-purple-400",
      iconBg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/40",
      chips: [
        { label: "Active Subscriptions", note: "Roster of repeating services (Netflix, Gym, AWS)" },
        { label: "Monthly Cost", note: "Total recurring drain every 30 days" },
        { label: "Annual Projected Cost", note: "Full 12-month commitment cost" },
        { label: "Upcoming Renewals", note: "Countdown alerts for bills due in ≤ 3 days" },
        { label: "Direct Removal", note: "You can remove a subscription directly from its card" }
      ],
      actionLabel: "Check Your Subscriptions",
      action: onOpenSubscriptions
    },
    {
      id: "health",
      badge: "Health Signals",
      title: "6. Financial Health & Audit",
      purpose: "Get a quick interpretation of your financial health without jargon.",
      whenToUse: "Whenever you want a simple, clear pulse check on your finances.",
      icon: Activity,
      iconColor: "text-rose-500 dark:text-rose-400",
      iconBg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40",
      chips: [
        { label: "What It Is", note: "Shows how your income, spending, savings, and financial habits are doing." },
        { label: "Savings Rate", note: "How much of your income remains after expenses." },
        { label: "Cash Flow", note: "Shows whether more money is coming in than going out." },
        { label: "Financial Health Score", note: "Combines key financial signals into a simple overall picture." }
      ],
      actionLabel: "View Financial Health",
      action: onOpenOverview
    }
  ]

  // 3. Quick Start 6-Step Checklist with Safe Auto-Completion
  const checklistItems = useMemo(() => [
    { 
      id: 1, 
      text: "Add your main income (Salary, Client payout, etc.)", 
      action: onOpenAddModal, 
      label: "Add Income",
      isAutoDone: hasIncome 
    },
    { 
      id: 2, 
      text: "Add your recent expenses (Groceries, Dining, Rent)", 
      action: onOpenAddModal, 
      label: "Add Expense",
      isAutoDone: hasExpense 
    },
    { 
      id: 3, 
      text: "Set your important budgets for top categories", 
      action: onOpenCategoryEnvelopes || onOpenBudgets, 
      label: "Set a Budget",
      isAutoDone: hasBudgets 
    },
    { 
      id: 4, 
      text: "Create a savings goal for an emergency fund or purchase", 
      action: onOpenSavingsGoals, 
      label: "Create a Goal",
      isAutoDone: hasGoals 
    },
    { 
      id: 5, 
      text: "Check your recurring subscriptions and renewal alerts", 
      action: onOpenSubscriptions, 
      label: "Check Subscriptions",
      isAutoDone: hasSubscriptions 
    },
    { 
      id: 6, 
      text: "Review your financial health and net cash position", 
      action: onCompleteOnboarding || onOpenOverview, 
      label: "View Financial Health",
      isAutoDone: manualCompleted.includes(6) 
    }
  ], [
    hasIncome, 
    hasExpense, 
    hasBudgets, 
    hasGoals, 
    hasSubscriptions, 
    manualCompleted, 
    onOpenAddModal, 
    onOpenBudgets, 
    onOpenCategoryEnvelopes, 
    onOpenSavingsGoals, 
    onOpenSubscriptions, 
    onCompleteOnboarding, 
    onOpenOverview
  ])

  const completedCount = checklistItems.filter(
    (item) => item.isAutoDone || manualCompleted.includes(item.id)
  ).length
  const progressPct = Math.round((completedCount / checklistItems.length) * 100)
  const isAllCompleted = completedCount === checklistItems.length

  // Coordinated Full Confetti Bomb Celebration Sequence
  const triggerConfettiBomb = useCallback(() => {
    // Respect prefers-reduced-motion (only skip if explicitly set by user's system)
    const prefersReducedMotion = typeof window !== "undefined" && 
      window.matchMedia && 
      window.matchMedia("(prefers-reduced-motion: reduce)").matches === true

    if (prefersReducedMotion) {
      return
    }

    const celebrationColors = [
      "#10b981", // Emerald
      "#3b82f6", // Blue
      "#6366f1", // Indigo
      "#a855f7", // Purple
      "#ec4899", // Pink
      "#f59e0b", // Amber
      "#7df9e5", // Vibrant Teal (portfolio accent)
      "#a58bff", // Vibrant Violet (portfolio accent)
      "#ffffff"  // Crisp White Sparkle
    ]

    const fireBombBurst = (opts) => {
      try {
        confetti({
          zIndex: 99999,
          ...opts
        })
      } catch {
        // ignore canvas confetti errors
      }
    }

    // Cancel any previous bursts before launching
    celebrationTimersRef.current.forEach((id) => clearTimeout(id))

    // Wave 1: Immediate Central Super-Explosion (T = 0ms)
    fireBombBurst({
      particleCount: 110,
      spread: 100,
      origin: { x: 0.5, y: 0.6 },
      startVelocity: 45,
      ticks: 200,
      colors: celebrationColors
    })

    // Wave 2: Left Cannon Blast towards center-right (T = 200ms)
    const t1 = setTimeout(() => {
      fireBombBurst({
        particleCount: 85,
        angle: 60,
        spread: 75,
        origin: { x: 0.05, y: 0.85 },
        startVelocity: 55,
        ticks: 220,
        colors: celebrationColors
      })
    }, 200)

    // Wave 3: Right Cannon Blast towards center-left (T = 400ms)
    const t2 = setTimeout(() => {
      fireBombBurst({
        particleCount: 85,
        angle: 120,
        spread: 75,
        origin: { x: 0.95, y: 0.85 },
        startVelocity: 55,
        ticks: 220,
        colors: celebrationColors
      })
    }, 400)

    // Wave 4: Cross-fire Shower from both sides (T = 750ms)
    const t3 = setTimeout(() => {
      fireBombBurst({
        particleCount: 65,
        angle: 55,
        spread: 60,
        origin: { x: 0.15, y: 0.75 },
        startVelocity: 42,
        ticks: 200,
        colors: celebrationColors
      })
      fireBombBurst({
        particleCount: 65,
        angle: 125,
        spread: 60,
        origin: { x: 0.85, y: 0.75 },
        startVelocity: 42,
        ticks: 200,
        colors: celebrationColors
      })
    }, 750)

    // Wave 5: High Star/Sparkle Canopy Finale (T = 1200ms)
    const t4 = setTimeout(() => {
      fireBombBurst({
        particleCount: 95,
        spread: 130,
        origin: { x: 0.5, y: 0.4 },
        startVelocity: 35,
        ticks: 240,
        colors: celebrationColors
      })
    }, 1200)

    celebrationTimersRef.current = [t1, t2, t3, t4]
  }, [])

  // Trigger full Confetti Bomb celebration on transition to 6/6 or initial uncelebrated 6/6 mount
  useEffect(() => {
    // When checklist is incomplete (< 6), reset persisted state so completing tasks always celebrates
    if (!isAllCompleted) {
      try {
        localStorage.removeItem(celebrationStorageKey)
      } catch {
        // ignore storage errors
      }
      prevCompletedCountRef.current = completedCount
      isInitialMountRef.current = false
      return
    }

    // Now completedCount === 6 (all tasks complete)
    const wasIncomplete = prevCompletedCountRef.current !== null && prevCompletedCountRef.current < checklistItems.length
    const isFirstMount = isInitialMountRef.current

    isInitialMountRef.current = false
    prevCompletedCountRef.current = completedCount

    let alreadyCelebrated = false
    try {
      alreadyCelebrated = localStorage.getItem(celebrationStorageKey) === "true"
    } catch {
      // ignore storage access error
    }

    // Fire celebration if user just completed tasks (transition from < 6 to 6) OR on first eligible mount
    if (wasIncomplete || (!alreadyCelebrated && isFirstMount)) {
      try {
        localStorage.setItem(celebrationStorageKey, "true")
      } catch {
        // ignore storage write errors
      }
      triggerConfettiBomb()
    }
  }, [isAllCompleted, completedCount, checklistItems.length, celebrationStorageKey, triggerConfettiBomb])

  // Cleanup timers on component unmount
  useEffect(() => {
    return () => {
      celebrationTimersRef.current.forEach((id) => clearTimeout(id))
      celebrationTimersRef.current = []
    }
  }, [])

  return (
    <div className="space-y-8 pb-12 w-full">
      {/* 1. SIMPLIFIED HERO */}
      <section className="relative overflow-hidden bg-surface-1 border border-border-default rounded-xl p-6 sm:p-8 shadow-elevation-sm">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 rounded-full bg-brand/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-subtle text-brand border border-brand/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Interactive Guide • 2-Minute Read</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight leading-tight">
            Understand Your Money with Ledger<span className="text-brand">XL</span>
          </h2>

          <p className="text-base sm:text-lg text-text-secondary max-w-3xl leading-relaxed">
            Track your income and spending, set budgets and savings goals, and understand your financial health — all in one place.
          </p>

          <p className="pt-1 text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">What is LedgerXL?</span> A personal financial tracking and planning dashboard designed to give you total cash flow clarity.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border-subtle mt-4">
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-hover active:bg-brand-active text-white text-sm font-semibold transition-all shadow-md shadow-brand/20 cursor-pointer w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add Your First Transaction</span>
            </button>
            <button
              onClick={onCompleteOnboarding || onOpenOverview}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-surface-2 hover:bg-surface-hover border border-border-default text-text-primary text-sm font-medium transition-colors cursor-pointer w-full sm:w-auto"
            >
              <span>{isOnboarding ? "Get Started — Go to Dashboard" : "Go to Financial Overview"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. HOW LEDGERXL WORKS — INTERCONNECTED FLOW */}
      <section className="bg-surface-1 border border-border-default rounded-xl p-5 sm:p-6 shadow-elevation-sm space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
            How LedgerXL Works
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Add your transactions → LedgerXL automatically updates your overview, spending insights, budgets, and financial health.
          </p>
        </div>

        {/* Visual 5-Step Pipeline */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border-subtle flex flex-col justify-between space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
                <Receipt className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-text-primary">1. Transactions</span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary leading-normal">Log daily income and expenses</p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border-subtle flex flex-col justify-between space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-text-primary">2. Overview</span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary leading-normal">Calculates net balance & breakdown</p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border-subtle flex flex-col justify-between space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-text-primary">3. Analytics</span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary leading-normal">Spots spending habits & trajectories</p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border-subtle flex flex-col justify-between space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-text-primary">4. Budgets & Goals</span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary leading-normal">Caps spending & plans savings targets</p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border-subtle flex flex-col justify-between space-y-1.5 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-text-primary">5. Health Audit</span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary leading-normal">Scores your savings rate & cash runway</p>
          </div>
        </div>

        {/* Bill Radar Sub-Pipeline Card */}
        <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              <Repeat className="h-4 w-4" />
            </div>
            <p className="text-text-secondary text-xs sm:text-sm leading-normal">
              <span className="font-semibold text-text-primary">Recurring Transactions</span> automatically flow into <span className="font-semibold text-text-primary">Bill Radar</span> for renewal countdowns and annual cost projections.
            </p>
          </div>
          <button
            onClick={onOpenSubscriptions}
            className="inline-flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400 hover:underline shrink-0 cursor-pointer text-xs sm:text-sm"
          >
            <span>Check Bill Radar</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      {/* 3. WHERE SHOULD I ADD WHAT? (FAST ACTION FINDER) */}
      <section className="space-y-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            Where Should I Add What?
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Click any card to jump directly to where you need to be:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {whereToAddItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-surface-1 border border-border-default hover:border-border-strong rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-elevation-sm hover:shadow-elevation-md group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-2xl shrink-0 p-1.5 bg-surface-2 rounded-xl border border-border-subtle inline-block">
                    {item.emoji}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border truncate max-w-[170px] ${item.badgeColor}`}>
                    {item.destination}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-text-primary tracking-tight leading-snug">
                  {item.intent}
                </h4>

                <p className="text-xs sm:text-sm text-text-secondary mt-1.5 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle">
                <button
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg bg-surface-2 hover:bg-surface-hover border border-border-subtle text-xs sm:text-sm font-semibold text-text-primary transition-colors cursor-pointer group-hover:border-brand/40"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 6 CORE SECTIONS OF LEDGERXL — SHORT MENTAL MODELS */}
      <section className="space-y-5">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            6 Core Sections of LedgerXL
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Simple mental models for each section — understand what each does in 15 seconds
          </p>
        </div>

        <div className="space-y-4">
          {coreSections.map((sec) => {
            const Icon = sec.icon
            return (
              <div
                key={sec.id}
                className="bg-surface-1 border border-border-default hover:border-border-strong rounded-xl p-5 sm:p-6 transition-all shadow-elevation-sm space-y-3"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${sec.iconBg}`}>
                      <Icon className={`h-5 w-5 ${sec.iconColor}`} />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                        {sec.title}
                      </h4>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-brand bg-brand-subtle px-3 py-1 rounded-md border border-brand/20 w-fit">
                    Purpose: &ldquo;{sec.purpose}&rdquo;
                  </span>
                </div>

                {/* When to use */}
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed pt-0.5">
                  <span className="font-semibold text-text-primary">When to use:</span> {sec.whenToUse}
                </p>

                {/* Section Specific Content: Two Cards (Budgets & Goals) or Chips */}
                {sec.twoCards ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {sec.twoCards.map((c, i) => (
                      <div key={i} className="p-4 rounded-xl border border-border-default bg-surface-2/40 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm sm:text-base font-bold text-text-primary">{c.title}</h5>
                            <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border ${c.tagColor}`}>
                              {c.tag}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-text-primary">{c.desc}</p>
                          <p className="text-xs text-text-muted font-mono-nums">{c.example}</p>
                          <p className="text-xs sm:text-sm text-text-secondary pt-2 border-t border-border-subtle leading-normal">
                            {c.shows}
                          </p>
                        </div>
                        <button
                          onClick={c.action}
                          className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-lg bg-surface-1 hover:bg-surface-hover border border-border-default text-xs sm:text-sm font-semibold text-text-primary transition-colors cursor-pointer"
                        >
                          <span>{c.actionLabel}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-text-muted" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                    {sec.chips?.map((c, i) => (
                      <div key={i} className="p-3 rounded-lg bg-surface-2/40 border border-border-subtle text-xs sm:text-sm">
                        <span className="font-semibold text-text-primary block">{c.label}</span>
                        <span className="text-xs text-text-secondary block mt-0.5 leading-normal">{c.note}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Section Action Button */}
                {sec.action && (
                  <div className="flex flex-wrap items-center gap-3 pt-3 mt-3 border-t border-border-subtle">
                    <button
                      onClick={sec.action}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover active:bg-brand-active text-white text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-brand/20 cursor-pointer"
                    >
                      <span>{sec.actionLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    {sec.secondaryAction && (
                      <button
                        onClick={sec.secondaryAction}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-2 hover:bg-surface-hover border border-border-default text-xs sm:text-sm font-medium text-text-primary transition-colors cursor-pointer"
                      >
                        <span>{sec.secondaryLabel}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* 5. QUICK START CHECKLIST WITH COMPLETION CELEBRATION */}
      <section className="bg-surface-1 border border-border-default rounded-xl p-5 sm:p-7 shadow-elevation-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
          {isAllCompleted ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={triggerConfettiBomb}
                title="Click to celebrate again! 🎉"
                className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 active:scale-95 flex items-center justify-center shrink-0 transition-all cursor-pointer"
              >
                <PartyPopper className="h-5 w-5" />
              </button>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
                  🎉 You&apos;re All Set!
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                  You&apos;ve completed your LedgerXL quick start.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h3 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
                  Quick Start Action Plan
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                Follow these simple steps to set up your financial dashboard:
              </p>
            </div>
          )}

          <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap w-full sm:w-auto">
            {isAllCompleted && (
              <button
                onClick={onCompleteOnboarding || onOpenOverview}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-emerald-600/20 cursor-pointer w-full sm:w-auto"
              >
                <span>Start Managing Your Finances</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
            <div className="text-right">
              <span className="text-sm font-bold text-text-primary">
                {completedCount} of {checklistItems.length}
              </span>
              <span className="text-xs text-text-muted block">completed</span>
            </div>
            <div className="w-20 sm:w-24 h-2.5 bg-surface-2 rounded-full overflow-hidden border border-border-subtle">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {checklistItems.map((item) => {
            const isDone = item.isAutoDone || manualCompleted.includes(item.id)
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
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

                  <span className={`text-sm sm:text-base font-medium ${
                    isDone ? "line-through text-text-muted" : "text-text-primary"
                  }`}>
                    <span className="font-semibold text-text-muted mr-1.5">{item.id}.</span>
                    {item.text}
                  </span>
                </div>

                <button
                  onClick={item.action}
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-brand hover:text-white bg-brand-subtle hover:bg-brand border border-brand/20 transition-all cursor-pointer shrink-0"
                >
                  {item.label}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* 6. PRIMARY COMPLETION CTA */}
      <section className="relative overflow-hidden bg-surface-1 border border-border-default hover:border-border-strong rounded-xl p-5 sm:p-7 shadow-elevation-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40 mb-0.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{isAllCompleted ? "🎉 Quick Start Complete" : "Ready to Begin"}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
            {isAllCompleted ? "🎉 You're All Set!" : "Ready to take command of your finances?"}
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {isAllCompleted 
              ? "You've completed your LedgerXL quick start. Jump straight into your personal Financial Overview." 
              : "Jump straight into your personal Financial Overview to start tracking your cash flow, budgets, and savings."}
          </p>
        </div>
        <div className="shrink-0 w-full sm:w-auto">
          <button
            onClick={onCompleteOnboarding || onOpenOverview}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover active:bg-brand-active text-white text-sm sm:text-base font-semibold transition-all shadow-md shadow-brand/25 cursor-pointer group"
          >
            <span>Start Managing Your Finances</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* 7. IMPORTANT CLARITY (DISCLAIMER) */}
      <section className="p-4 rounded-xl bg-surface-2/80 border border-border-subtle flex items-start gap-3 text-text-secondary text-xs sm:text-sm leading-relaxed">
        <Info className="h-4 w-4 text-brand shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-text-primary text-xs sm:text-sm">
            Important Clarity
          </p>
          <p className="text-xs sm:text-sm text-text-secondary">
            LedgerXL is a personal finance tracking and planning tool. It helps you monitor, visualize, and budget your finances; it does not automatically move or manage bank deposits.
          </p>
        </div>
      </section>
    </div>
  )
}
