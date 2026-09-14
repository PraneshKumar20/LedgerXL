import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  Layers, 
  Radio, 
  Command, 
  Database, 
  LogOut, 
  CheckCircle2,
  ArrowRight,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw
} from "lucide-react"
import { parseQuickAdd } from "../../utils/quickAddParser"
import { getGradeBadgeStyle } from "../../utils/healthScoring"
import ThemeToggle from "../ui/ThemeToggle"

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenQuickAdd,
  onSeedDemo,
  transactionCount = 0,
  recurringCount = 0,
  healthGrade = "A+",
  healthScore = null,
  goalsCount = 0,
  currency,
  setCurrency,
  currentUser,
  onLogout,
  onSaveTransaction,
  isCollapsed = false,
  onToggleCollapse
}) {
  const [quickAddQuery, setQuickAddQuery] = useState("")
  const [isQuickAddFocused, setIsQuickAddFocused] = useState(false)
  const [quickAddSuccess, setQuickAddSuccess] = useState(null)
  const currencySymbol = currency === "INR" ? "₹" : "$"

  const userInitials = useMemo(() => {
    if (!currentUser?.name || currentUser.name === "Demo Explorer") return "PE"
    const parts = currentUser.name.trim().split(/\s+/)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return currentUser.name.slice(0, 2).toUpperCase()
  }, [currentUser?.name])

  const samplePrompts = [
    `Spent ${currencySymbol}45 on groceries yesterday`,
    `Uber ride to airport ${currencySymbol}28 travel`,
    `Freelance client design ${currencySymbol}850 salary`,
    `Netflix monthly ${currencySymbol}15.99 subscription`,
    `Electricity bill ${currencySymbol}115 bills`
  ]

  const handleQuickAddKeyDown = (e) => {
    if (e.key === "Enter") {
      if (!quickAddQuery.trim()) return
      const parsed = parseQuickAdd(quickAddQuery)
      if (parsed && parsed.isValid) {
        onSaveTransaction(parsed)
        setQuickAddQuery("")
        setQuickAddSuccess(parsed)
        setTimeout(() => setQuickAddSuccess(null), 2000)
      }
    }
  }

  const handlePromptClick = (promptStr) => {
    setQuickAddQuery(promptStr)
  }

  const renderNavBadge = (itemId, isActive = false) => {
    switch (itemId) {
      case "transactions":
        return (
          <div className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:border-rose-800/60 dark:text-rose-400 font-mono text-xs shrink-0 flex items-center justify-center min-w-[24px]">
            {transactionCount || 12}
          </div>
        )

      case "analytics": {
        const badgeStyle = getGradeBadgeStyle(healthGrade, isActive, healthScore)
        return (
          <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 border transition-colors ${badgeStyle.badgeClass}`}>
            Grade {badgeStyle.gradeText}
          </div>
        )
      }

      case "budgets":
        return (
          <div className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/80 dark:border-emerald-800/60 dark:text-emerald-400 text-xs font-medium shrink-0 flex items-center gap-1">
            <span>🎯</span>
            <span>{goalsCount || 3} Goals</span>
          </div>
        )

      case "subscriptions":
        return (
          <div className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/80 dark:border-amber-800/60 dark:text-amber-400 font-mono text-xs shrink-0 flex items-center gap-1.5">
            <span>{recurringCount || 5}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.9)] animate-pulse" />
          </div>
        )

      default:
        return null
    }
  }

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      iconColor: "text-blue-400 group-hover:text-blue-300"
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: Receipt,
      iconColor: "text-rose-400 group-hover:text-rose-300"
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      iconColor: "text-indigo-400 group-hover:text-indigo-300"
    },
    {
      id: "budgets",
      label: "Budgets & Goals",
      icon: Layers,
      iconColor: "text-emerald-400 group-hover:text-emerald-300"
    },
    {
      id: "subscriptions",
      label: "Bill Radar",
      icon: Radio,
      iconColor: "text-amber-400 group-hover:text-amber-300"
    }
  ]

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 68 : 280 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="hidden lg:flex flex-col shrink-0 bg-surface-inset border-r border-border-subtle h-screen sticky top-0 z-40 select-none overflow-hidden relative"
    >
      <div className="relative w-full h-full overflow-hidden">
        <AnimatePresence initial={false}>
          {isCollapsed ? (
            /* =====================================================
               COLLAPSED STATE (Pixel-accurate matching reference)
               ===================================================== */
            <motion.div
              key="sidebar-collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="absolute inset-0 w-[68px] h-full flex flex-col justify-between items-center"
            >
              {/* Top Header: Logo on top, Expand button beneath, divider border */}
              <div className="w-full pt-4 pb-3.5 border-b border-border-subtle flex flex-col items-center gap-3 shrink-0">
                <button
                  onClick={() => setActiveTab("overview")}
                  className="hover:scale-105 transition-transform cursor-pointer"
                  title="LedgerFlow Overview"
                >
                  <img 
                    src="/ledgerflow-logo.png" 
                    alt="LedgerFlow Logo" 
                    className="h-8 w-8 object-contain drop-shadow-md rounded-lg" 
                  />
                </button>
                <button
                  onClick={onToggleCollapse}
                  className="p-1 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  title="Expand sidebar (Ctrl+B)"
                >
                  <PanelLeftOpen className="h-5 w-5 text-brand hover:text-brand-hover transition-colors" />
                </button>
              </div>

              {/* Middle Action Area */}
              <div className="flex-1 w-full py-4 flex flex-col items-center overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {/* 5 Navigation Items */}
                <nav className="w-full flex flex-col items-center space-y-2.5">
                  {navItems.map((item) => {
                    const isActive = activeTab === item.id
                    const Icon = item.icon
                    const badgeContent = renderNavBadge(item.id)

                    return (
                      <div key={item.id} className="relative group flex justify-center">
                        <button
                          onClick={() => setActiveTab(item.id)}
                          className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-150 cursor-pointer ${
                            isActive
                              ? "bg-brand text-white shadow-lg shadow-brand/30"
                              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                          }`}
                          title={item.label}
                        >
                          <Icon 
                            className={`h-5 w-5 shrink-0 transition-colors ${
                              isActive 
                                ? "text-white stroke-[2.2]" 
                                : `${item.iconColor || "text-text-secondary group-hover:text-text-primary"} stroke-[1.8]`
                            }`} 
                          />
                        </button>

                        {/* Floating Tooltip */}
                        <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-surface-2 border border-border-strong text-text-primary text-xs font-semibold rounded-md shadow-elevation-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 flex items-center gap-2">
                          <span>{item.label}</span>
                          {badgeContent}
                        </div>
                      </div>
                    )
                  })}
                </nav>

                {/* Quick Add / Command squircle button */}
                <div className="relative group mt-6 flex justify-center">
                  <button
                    onClick={onOpenQuickAdd}
                    className="w-11 h-11 rounded-2xl bg-surface-inset hover:bg-surface-2 border border-border-subtle hover:border-border-strong flex items-center justify-center transition-all cursor-pointer shadow-elevation-sm"
                    title="Quick Add Command (Ctrl+K)"
                  >
                    <Command className="h-5 w-5 text-brand" />
                  </button>
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-surface-2 border border-border-strong text-text-primary text-xs font-semibold rounded-md shadow-elevation-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    Quick Add (Ctrl+K)
                  </div>
                </div>

                {/* Settings & Data Section (Theme + Currency + Database) */}
                <div className="mt-3 flex flex-col items-center space-y-2.5">
                  {/* Theme Toggle */}
                  <div className="relative group">
                    <ThemeToggle className="w-11 h-11 rounded-2xl bg-surface-inset hover:bg-surface-2 border border-border-subtle hover:border-border-strong text-text-secondary hover:text-text-primary flex items-center justify-center transition-all cursor-pointer shadow-elevation-sm" />
                    <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-surface-2 border border-border-strong text-text-primary text-xs font-semibold rounded-md shadow-elevation-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      Toggle Theme
                    </div>
                  </div>

                  {/* Currency Toggle */}
                  <div className="relative group">
                    <button
                      onClick={() => setCurrency(currency === "INR" ? "USD" : "INR")}
                      className="w-11 h-11 rounded-2xl bg-surface-inset hover:bg-surface-2 border border-border-subtle hover:border-border-strong text-text-primary font-bold text-sm flex items-center justify-center transition-all cursor-pointer shadow-elevation-sm font-sans"
                      title={`Switch Currency (${currency})`}
                    >
                      {currencySymbol}
                    </button>
                    <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-surface-2 border border-border-strong text-text-primary text-xs font-semibold rounded-md shadow-elevation-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      Currency: {currency} (Click to toggle)
                    </div>
                  </div>

                  {/* Reset Demo Data (Database Icon) */}
                  <div className="relative group">
                    <button
                      onClick={onSeedDemo}
                      className="w-11 h-11 rounded-2xl bg-surface-inset hover:bg-surface-2 border border-border-subtle hover:border-border-strong text-text-secondary hover:text-text-primary flex items-center justify-center transition-all cursor-pointer shadow-elevation-sm"
                      title="Reset Demo Data"
                    >
                      <Database className="h-5 w-5" />
                    </button>
                    <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-surface-2 border border-border-strong text-text-primary text-xs font-semibold rounded-md shadow-elevation-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      Reset Demo Data
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsed Footer: Divider, Squircle Avatar, Logout */}
              <div className="w-full pt-3 pb-4 border-t border-border-subtle flex flex-col items-center gap-3 shrink-0">
                <div className="relative group">
                  <div className="w-11 h-11 rounded-2xl bg-surface-2 border border-border-subtle flex items-center justify-center text-xs font-bold text-text-primary tracking-wider cursor-default shadow-inner">
                    {userInitials}
                  </div>
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-surface-2 border border-border-strong text-text-primary text-xs rounded-md shadow-elevation-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 space-y-0.5">
                    <p className="font-semibold">{currentUser?.name || "Demo Explorer"}</p>
                    <p className="text-[10px] text-text-secondary">{currentUser?.isGuest ? "Guest Mode" : currentUser?.email || "Active Session"}</p>
                  </div>
                </div>

                <div className="relative group">
                  <button
                    onClick={onLogout}
                    title="Sign Out"
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-text-secondary hover:text-negative hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-surface-2 border border-border-strong text-negative text-xs font-semibold rounded-md shadow-elevation-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    Sign Out
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* =====================================================
               EXPANDED STATE
               ===================================================== */
            <motion.div
              key="sidebar-expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="absolute inset-0 w-[280px] h-full flex flex-col justify-between"
            >
              {/* Header */}
              <div className="h-16 px-4 border-b border-border-subtle flex items-center justify-between shrink-0">
                <button
                  onClick={() => setActiveTab("overview")}
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer group text-left"
                  title="LedgerFlow Overview"
                >
                  <img 
                    src="/ledgerflow-logo.png" 
                    alt="LedgerFlow Logo" 
                    className="h-8 w-8 object-contain shrink-0 drop-shadow-elevation-sm rounded-lg group-hover:scale-105 transition-transform" 
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-[15px] leading-tight tracking-tight text-text-primary block truncate font-sans group-hover:text-brand transition-colors">
                      LedgerFlow
                    </span>
                    <p className="text-[11px] leading-tight text-text-secondary font-normal truncate mt-0.5 font-sans">
                      Personal Financial Command
                    </p>
                  </div>
                </button>
                <button
                  onClick={onToggleCollapse}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer shrink-0"
                  title="Collapse sidebar (Ctrl+B)"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </div>

              {/* Main Scrollable Content */}
              <div className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden flex flex-col">
                {/* Navigation Section */}
                <div>
                  <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
                    Navigation
                  </p>
                  <nav className="space-y-1">
                    {navItems.map((item) => {
                      const isActive = activeTab === item.id
                      const Icon = item.icon
                      const badgeContent = renderNavBadge(item.id, isActive)

                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full min-h-[40px] py-2 flex items-center justify-between px-3 rounded-lg text-sm transition-all duration-150 cursor-pointer group ${
                            isActive
                              ? "bg-brand-subtle text-brand border border-brand/20 dark:bg-brand dark:text-white dark:border-transparent font-medium shadow-elevation-sm"
                              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover font-normal"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon className={`h-4 w-4 shrink-0 transition-colors duration-150 ${
                              isActive ? "text-brand dark:text-white" : (item.iconColor || "text-text-secondary group-hover:text-text-primary")
                            }`} />
                            <span className="truncate">{item.label}</span>
                          </div>

                          {badgeContent}
                        </button>
                      )
                    })}
                  </nav>
                </div>

                {/* Quick Add Section */}
                <div className="mt-6">
                  <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
                    Quick Add
                  </p>

                  <div className="px-1">
                    <div 
                      className="relative flex items-center h-10 rounded-lg border border-border-default bg-surface-1 px-3 transition-colors duration-150 focus-within:border-border-strong"
                    >
                      <span className="text-text-secondary text-sm font-medium mr-2">⌘</span>
                      <input
                        type="text"
                        value={quickAddQuery}
                        onChange={(e) => setQuickAddQuery(e.target.value)}
                        onFocus={() => setIsQuickAddFocused(true)}
                        onBlur={() => setTimeout(() => setIsQuickAddFocused(false), 200)}
                        onKeyDown={handleQuickAddKeyDown}
                        placeholder="Type naturally..."
                        className="w-full bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none pr-6"
                      />
                      {quickAddSuccess ? (
                        <div className="absolute right-2 flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded text-[9px] dark:border-emerald-800/40">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Added</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuickAddKeyDown({ key: "Enter" })}
                          className="absolute right-2 px-1.5 py-0.5 text-[10px] font-mono text-text-secondary hover:text-text-primary bg-surface-2 hover:bg-surface-hover border border-border-default/60 rounded cursor-pointer transition-colors"
                          title="Add Transaction (Enter)"
                        >
                          ↵
                        </button>
                      )}
                    </div>
                    
                    {/* Contextual Suggestions */}
                    {isQuickAddFocused && !quickAddQuery && (
                      <div className="mt-2 p-1 rounded-lg bg-surface-1 border border-border-default space-y-0.5 shadow-lg">
                        {samplePrompts.slice(0, 3).map((prompt, idx) => (
                          <button
                            key={idx}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              handlePromptClick(prompt)
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-hover text-left cursor-pointer group transition-colors duration-150"
                          >
                            <ArrowRight className="h-3 w-3 text-text-muted group-hover:text-brand transition-colors shrink-0" />
                            <span className="text-[11px] text-text-secondary group-hover:text-text-primary truncate">{prompt}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Settings & Data Section */}
                <div className="mt-6">
                  <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
                    Settings & Data
                  </p>

                  <div className="px-1 space-y-2">
                    {/* Theme Selector */}
                    <div className="h-10 px-3 bg-surface-1 rounded-lg border border-border-default flex items-center justify-between">
                      <span className="text-xs text-text-primary font-medium">Theme</span>
                      <ThemeToggle variant="outline" showLabel={true} className="!py-1 !px-2.5 !h-7 text-xs" />
                    </div>

                    {/* Currency Selector */}
                    <div className="h-10 px-3 bg-surface-1 rounded-lg border border-border-default flex items-center justify-between">
                      <span className="text-xs text-text-primary font-medium">Currency</span>
                      <div className="flex bg-background p-0.5 rounded-md border border-border-subtle">
                        {["INR", "USD"].map((c) => {
                          const active = currency === c
                          return (
                            <button
                              key={c}
                              onClick={() => setCurrency(c)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer transition-all duration-150 ${
                                active
                                  ? "bg-brand text-white shadow-elevation-sm"
                                  : "text-text-secondary hover:text-text-primary"
                              }`}
                            >
                              {c === "USD" ? "$ USD" : "₹ INR"}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Seed Demo button */}
                    <button
                      onClick={onSeedDemo}
                      className="w-full h-9 flex items-center gap-2.5 px-3 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors duration-150 cursor-pointer group"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-text-secondary group-hover:text-text-primary transition-colors duration-150 shrink-0" />
                      <span>Reset Demo Data</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded User / Session Area */}
              <div className="p-3 border-t border-border-subtle bg-transparent shrink-0">
                <div className="h-[56px] px-3 rounded-xl bg-surface-1 border border-border-subtle flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-surface-2 border border-border-default/60 flex items-center justify-center text-xs font-bold text-text-primary shrink-0 font-sans">
                      {userInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-text-primary truncate leading-tight">
                        {currentUser?.name || "Demo Explorer"}
                      </p>
                      <p className="text-[11px] text-text-secondary truncate mt-0.5 leading-tight">
                        {currentUser?.isGuest ? "Guest Mode" : currentUser?.email || "Active Session"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    title="Sign Out"
                    className="p-1.5 text-text-secondary hover:text-negative transition-colors duration-150 cursor-pointer shrink-0"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  )
}
