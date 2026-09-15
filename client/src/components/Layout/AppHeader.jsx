import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  ChevronDown, 
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react"

import ThemeToggle from "../ui/ThemeToggle"

export default function AppHeader({
  activeTab,
  onOpenAddModal,
  currentUser,
  onLogout,
  isSidebarCollapsed,
  onToggleSidebar
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const titles = {
    overview: {
      title: "Financial Overview",
      subtitle: "Your complete financial picture, at a glance."
    },
    transactions: {
      title: "Transaction Ledger",
      subtitle: "Comprehensive journal of income, expenses, and recurring outflows"
    },
    analytics: {
      title: "Analytics & Insights",
      subtitle: "Financial health audit, spend distribution, and trend patterns"
    },
    budgets: {
      title: "Budgets & Milestones",
      subtitle: "Category envelope limits, monthly quotas, and milestone savings goals"
    },
    subscriptions: {
      title: "Recurring Subscriptions",
      subtitle: "Proactive tracking of active subscriptions and cycle renewals"
    }
  }

  const current = titles[activeTab] || titles.overview

  return (
    <header className="hidden lg:flex items-center justify-between mb-6">
      <div>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg bg-surface-1 hover:bg-surface-hover border border-border-default text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title={isSidebarCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4 text-brand" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
          <h1 className="text-2xl sm:text-[28px] font-bold text-text-primary tracking-tight leading-tight">
            {current.title}
          </h1>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
            <span>LIVE</span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-text-secondary mt-1.5 font-normal leading-relaxed pl-11">
          {current.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <ThemeToggle variant="outline" />

        {/* New Transaction Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover active:bg-brand-active text-white text-sm font-semibold tracking-wide transition-all shadow-md shadow-brand/20 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>New Transaction</span>
        </button>

        {/* User Session Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-1 hover:bg-surface-hover border border-border-default transition-colors cursor-pointer text-xs font-bold text-text-primary"
          >
            <span>{currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "DE"}</span>
            <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 mt-2 w-52 rounded-xl bg-surface-1 border border-border-default shadow-elevation-lg p-1.5 z-50 space-y-1"
              >
                <div className="px-2.5 py-1.5 border-b border-border-subtle">
                  <p className="text-xs font-semibold text-text-primary truncate">{currentUser?.name || "Demo Explorer"}</p>
                  <p className="text-[10px] text-text-secondary truncate">{currentUser?.email || "guest@ledgerflow.app"}</p>
                  {currentUser?.isGuest && (
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded bg-brand-subtle text-brand border border-brand/20 text-[9px] font-medium">
                      Guest Mode
                    </span>
                  )}
                </div>
                <button
                  onClick={onLogout}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium text-negative hover:bg-negative/10 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
