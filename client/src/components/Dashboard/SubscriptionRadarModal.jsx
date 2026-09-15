import { useMemo } from "react"
import { formatNumber } from "../../utils/formatUtils"
import { motion, AnimatePresence } from "framer-motion"
import { Radio, Repeat, Clock, Calendar, X, Flame, CreditCard, Plus, Bell } from "lucide-react"
import AnimatedCounter from "../ui/AnimatedCounter"
import { getSubscriptionBrand } from "../../utils/subscriptionLogos"
import { getCategoryStyle } from "../../utils/categoryColors"

export default function SubscriptionRadarModal({
  isOpen,
  onClose,
  expenses = [],
  currencySymbol = "₹",
  multiplier = 1,
  onOpenAddModal
}) {
  // Extract all recurring expenses
  const recurringSubscriptions = useMemo(() => {
    if (!Array.isArray(expenses)) return []

    return expenses
      .filter(e => e.isRecurring && e.type === 'expense')
      .map(item => {
        // Calculate estimated next billing date (same day of next month)
        const txDate = new Date(item.date || Date.now())
        const now = new Date()
        const billingDay = txDate.getDate()
        // Clamp to the last day of the target month so a billing day of
        // 29/30/31 doesn't overflow into the following month (e.g. Jan 31 -> Mar 3)
        const safeMonthDate = (year, month, day) => {
          const lastDay = new Date(year, month + 1, 0).getDate()
          return new Date(year, month, Math.min(day, lastDay))
        }

        let nextBilling = safeMonthDate(now.getFullYear(), now.getMonth(), billingDay)
        if (nextBilling < now) {
          nextBilling = safeMonthDate(now.getFullYear(), now.getMonth() + 1, billingDay)
        }

        const diffTime = nextBilling.getTime() - now.getTime()
        const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

        return {
          ...item,
          amount: Number(item.amount) || 0,
          nextBillingDate: nextBilling.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          daysUntilRenewal: diffDays,
          isImminent: diffDays <= 3
        }
      })
      .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal)
  }, [expenses])

  // Summary Metrics
  const { monthlyBurn, annualBurn, upcomingCount } = useMemo(() => {
    const totalMonth = recurringSubscriptions.reduce((sum, item) => sum + item.amount, 0)
    const totalYear = totalMonth * 12
    const upcoming = recurringSubscriptions.filter(item => item.isImminent).length
    const top = recurringSubscriptions.length > 0
      ? [...recurringSubscriptions].sort((a, b) => b.amount - a.amount)[0]
      : null

    return {
      monthlyBurn: totalMonth,
      annualBurn: totalYear,
      upcomingCount: upcoming,
      topSubscription: top
    }
  }, [recurringSubscriptions])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-surface-overlay backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-2xl bg-surface-2 border border-border-default rounded-modal shadow-elevation-modal overflow-hidden z-10 p-5 space-y-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border-default pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-control bg-surface-3 text-brand">
                    <Radio className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold text-text-primary tracking-tight">
                    Subscription & Bill Radar
                  </h2>
                </div>
                <p className="text-xs text-text-secondary font-normal mt-0.5">
                  Tracking of recurring commitments, annual burn, and renewal cycles.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-text-secondary hover:text-text-primary rounded-control hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Key Burn Rate Metrics Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-card bg-surface-1 border border-border-default">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] uppercase font-semibold tracking-[0.06em] text-text-muted">
                  <Flame className="h-3.5 w-3.5 text-negative" />
                  <span>Monthly Burn</span>
                </div>
                <p className="text-xl font-semibold text-text-primary font-mono-nums">
                  {currencySymbol}<AnimatedCounter value={monthlyBurn} decimals={2} />
                  <span className="text-xs font-normal text-text-secondary">/mo</span>
                </p>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-border-default pt-2 sm:pt-0 sm:pl-3">
                <div className="flex items-center gap-1.5 text-[11px] uppercase font-semibold tracking-[0.06em] text-text-muted">
                  <Clock className="h-3.5 w-3.5 text-brand" />
                  <span>Annualized Cost</span>
                </div>
                <p className="text-xl font-semibold text-text-primary font-mono-nums">
                  {currencySymbol}<AnimatedCounter value={annualBurn} decimals={0} />
                  <span className="text-xs font-normal text-text-secondary">/yr</span>
                </p>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-border-default pt-2 sm:pt-0 sm:pl-3">
                <div className="flex items-center gap-1.5 text-[11px] uppercase font-semibold tracking-[0.06em] text-text-muted">
                  <Bell className="h-3.5 w-3.5 text-warning" />
                  <span>Due Soon</span>
                </div>
                <p className="text-xl font-semibold text-text-primary font-mono-nums flex items-center gap-1.5">
                  <span>{upcomingCount}</span>
                  <span className="text-xs font-normal text-text-secondary font-sans">
                    {upcomingCount === 1 ? "renews this week" : "renewing soon"}
                  </span>
                </p>
              </div>
            </div>

            {/* Subscriptions List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                  <Repeat className="h-3.5 w-3.5 text-brand" />
                  <span>Active Recurring Subscriptions ({recurringSubscriptions.length})</span>
                </h3>
                <button
                  onClick={() => {
                    onClose()
                    onOpenAddModal()
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-hover transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add New</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {recurringSubscriptions.length === 0 ? (
                  <div className="text-center py-10 rounded-card bg-surface-1 border border-border-default text-text-secondary text-xs space-y-2">
                    <Radio className="h-6 w-6 text-text-muted mx-auto" />
                    <p className="font-semibold text-text-primary">No active recurring commitments detected</p>
                    <p className="text-text-muted text-[11px]">Mark any transaction as "Recurring" or add a subscription to track renewals here.</p>
                  </div>
                ) : (
                  recurringSubscriptions.map((sub) => {
                    const brand = getSubscriptionBrand(sub.title, sub.category)
                    const categoryStyle = getCategoryStyle(sub.category)
                    return (
                      <div
                        key={sub._id}
                        className="p-3 rounded-xl bg-surface-1 border border-border-default hover:border-border-strong transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border-default/60 flex items-center justify-center shrink-0">
                            {brand.icon}
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-text-primary group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                                {sub.title}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${categoryStyle.badge}`}>
                                {sub.category}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded-badge font-semibold uppercase font-mono-nums bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40">
                                <Repeat className="h-2.5 w-2.5" /> RECURRING
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-text-secondary">
                              <Calendar className="h-3 w-3 text-text-muted" />
                              <span>Next: <strong className="text-text-primary font-mono">{sub.nextBillingDate}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Renewal Countdown Badge & Cost */}
                        <div className="text-right space-y-1">
                          <p className="font-mono font-bold text-sm text-text-primary">
                            {currencySymbol}{formatNumber(sub.amount, currencySymbol, 2, 2)}
                            <span className="text-xs text-text-secondary font-normal ml-0.5">/month</span>
                          </p>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                            sub.isImminent 
                              ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-400' 
                              : 'bg-surface-2/60 border-border-default/60 text-text-secondary'
                          }`}>
                            <Clock className="h-2.5 w-2.5" />
                            {sub.daysUntilRenewal === 0 ? "Renews Today" : sub.daysUntilRenewal === 1 ? "Tomorrow" : `In ${sub.daysUntilRenewal}d`}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-border-default flex items-center justify-between">
              <p className="text-[11px] text-text-secondary">
                Canceling just one $15/mo subscription frees up ${formatNumber(15 * 12, "USD", 0, 0)} every year.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-control bg-brand hover:bg-brand-hover active:bg-brand-active text-white text-xs font-medium transition-colors shadow-elevation-sm cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
