import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  Layers, 
  Radio,
  Plus, 
  Command, 
  Menu, 
  X, 
  LogOut 
} from "lucide-react"
import ThemeToggle from "../ui/ThemeToggle"

export default function MobileNav({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenQuickAdd,
  currency,
  setCurrency,
  currentUser,
  onLogout
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, iconColor: "text-blue-400" },
    { id: "transactions", label: "Transactions Ledger", icon: Receipt, iconColor: "text-rose-400" },
    { id: "analytics", label: "Analytics & Insights", icon: BarChart3, iconColor: "text-indigo-400" },
    { id: "budgets", label: "Budgets & Milestones", icon: Layers, iconColor: "text-emerald-400" },
    { id: "subscriptions", label: "Bill Radar", icon: Radio, iconColor: "text-amber-400" }
  ]

  const handleNavClick = (tabId) => {
    setActiveTab(tabId)
    setIsDrawerOpen(false)
  }

  return (
    <>
      {/* Mobile Top App Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-surface-1 border-b border-border-default px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-1 text-text-secondary hover:text-text-primary rounded-control hover:bg-surface-hover transition-colors cursor-pointer"
            title="Open Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <img src="/ledgerflow-logo.png?v=2" alt="LedgerFlow Logo" className="h-7 w-7 object-contain drop-shadow-sm" />
          <span className="font-bold text-sm tracking-tight text-text-primary">LedgerFlow</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Theme Toggle */}
          <ThemeToggle className="p-1 text-text-secondary hover:text-text-primary rounded-control" />

          {/* Quick Currency Switcher */}
          <div className="flex bg-surface-inset p-0.5 rounded-control border border-border-subtle">
            {["INR", "USD"].map((c) => {
              const active = currency === c
              return (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2 py-0.5 text-[11px] font-mono-nums font-semibold rounded-control cursor-pointer transition-colors ${
                    active ? "bg-brand text-white shadow-elevation-sm" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {c}
                </button>
              )
            })}
          </div>

          {/* Quick Add Cmd+K Button */}
          <button
            onClick={onOpenQuickAdd}
            className="p-1.5 rounded-control bg-surface-2 border border-border-default text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
            title="Quick Add"
          >
            <Command className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Slide-out Mobile Navigation Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-surface-overlay backdrop-blur-sm"
            />

            {/* Drawer Sheet */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative w-72 max-w-[85vw] bg-surface-1 border-r border-border-default h-full flex flex-col z-10 shadow-elevation-modal p-4"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border-default">
                <div className="flex items-center gap-2.5">
                  <img src="/ledgerflow-logo.png?v=2" alt="LedgerFlow Logo" className="h-7 w-7 object-contain" />
                  <div>
                    <span className="font-bold text-sm tracking-tight text-text-primary block">LedgerFlow</span>
                    <p className="text-[10px] text-text-secondary">Financial Command</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-text-secondary hover:text-text-primary rounded-control hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 py-4 space-y-1.5 overflow-y-auto">
                <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  Navigation
                </p>
                {navItems.map((item) => {
                  const isActive = activeTab === item.id
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-control text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? "text-brand bg-surface-selected font-semibold border border-border-default shadow-elevation-sm"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "" : item.iconColor || ""}`} />
                      <span>{item.label}</span>
                    </button>
                  )
                })}

                <div className="pt-4 border-t border-border-subtle my-2">
                  <p className="px-2.5 pb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    Quick Actions
                  </p>
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false)
                      onOpenAddModal()
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-control text-xs font-medium text-positive bg-positive/10 border border-positive/20 mb-2 cursor-pointer transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Transaction</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false)
                      onOpenQuickAdd()
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-control text-xs font-medium text-brand bg-brand/10 border border-brand/20 mb-2 cursor-pointer transition-colors"
                  >
                    <Command className="h-4 w-4" />
                    <span>Quick Add Dialog</span>
                  </button>

                  <div className="flex items-center justify-between p-2 rounded-control bg-surface-2 border border-border-default">
                    <span className="text-xs font-medium text-text-primary pl-1">Theme</span>
                    <ThemeToggle variant="outline" showLabel={true} className="!py-1 !px-2.5 !h-7 text-xs" />
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-3 border-t border-border-default">
                <div className="p-2 rounded-control bg-surface-2 border border-border-default flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-7 w-7 rounded-control bg-surface-3 border border-border-subtle flex items-center justify-center text-xs font-bold text-text-primary shrink-0">
                      {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "PL"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-primary truncate">
                        {currentUser?.name || "Personal Ledger"}
                      </p>
                      <p className="text-[10px] text-text-secondary truncate">
                        {currentUser?.email || "Active User"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    title="Sign Out"
                    className="p-1 text-text-secondary hover:text-negative hover:bg-negative/10 rounded-control transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-1 border-t border-border-default px-2 py-1.5 pb-safe shadow-elevation-lg">
        <div className="flex items-center justify-around relative">
          {/* Overview */}
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors cursor-pointer ${
              activeTab === "overview" ? "text-brand font-semibold" : "text-text-secondary hover:text-text-primary font-medium"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-[11px] mt-1">Overview</span>
          </button>

          {/* Transactions */}
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors cursor-pointer ${
              activeTab === "transactions" ? "text-brand font-semibold" : "text-rose-400/80 hover:text-rose-300 font-medium"
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span className="text-[11px] mt-1">Ledger</span>
          </button>

          {/* Center (+) New Transaction Action */}
          <div className="relative -top-2">
            <button
              onClick={onOpenAddModal}
              className="h-10 w-10 rounded-full bg-brand hover:bg-brand-hover active:bg-brand-active text-white flex items-center justify-center shadow-elevation-md border-2 border-surface-1 active:scale-95 transition-transform cursor-pointer"
              title="Add Transaction"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Analytics */}
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors cursor-pointer ${
              activeTab === "analytics" ? "text-brand font-semibold" : "text-text-secondary hover:text-text-primary font-medium"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span className="text-[11px] mt-1">Analytics</span>
          </button>

          {/* Budgets & Radar */}
          <button
            onClick={() => setActiveTab("budgets")}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors cursor-pointer ${
              activeTab === "budgets" || activeTab === "subscriptions" ? "text-brand font-semibold" : "text-text-secondary hover:text-text-primary font-medium"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span className="text-[11px] mt-1">Budgets</span>
          </button>
        </div>
      </nav>
    </>
  )
}
