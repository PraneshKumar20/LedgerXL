import { useState, useMemo } from "react"
import { formatNumber } from "../../utils/formatUtils"
import { getCategoryStyle } from "../../utils/categoryColors"
import { getSubscriptionBrand } from "../../utils/subscriptionLogos"
import { 
  Radio, 
  Clock, 
  Plus, 
  AlertTriangle, 
  CreditCard, 
  Bell,
  Repeat,
  Trash2,
  AlertCircle
} from "lucide-react"
import AnimatedCounter from "../ui/AnimatedCounter"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../ui/dialog"
import { Button } from "../ui/button"

export default function SubscriptionsView({
  displayExpenses = [],
  currencySymbol = "₹",
  openAddModal,
  onDelete
}) {
  const [subscriptionToDelete, setSubscriptionToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const recurringSubscriptions = useMemo(() => {
    if (!Array.isArray(displayExpenses)) return []

    return displayExpenses
      .filter(e => e.isRecurring && e.type === 'expense')
      .map(item => {
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
          nextBillingDate: nextBilling.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          daysUntilRenewal: diffDays,
          billingDay
        }
      })
      .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal)
  }, [displayExpenses])

  const { monthlyBurn, annualBurn, imminentRenewals } = useMemo(() => {
    const monthly = recurringSubscriptions.reduce((acc, curr) => acc + curr.amount, 0)
    const imminent = recurringSubscriptions.filter(s => s.daysUntilRenewal <= 3)
    return {
      monthlyBurn: monthly,
      annualBurn: monthly * 12,
      imminentRenewals: imminent
    }
  }, [recurringSubscriptions])

  const handleConfirmDelete = async () => {
    if (!subscriptionToDelete || !onDelete) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const subId = subscriptionToDelete._id || subscriptionToDelete.id
      const success = await onDelete(subId, "Subscription removed from ledger.")
      if (success !== false) {
        setSubscriptionToDelete(null)
      } else {
        setDeleteError("Failed to delete subscription. Please try again.")
      }
    } catch (err) {
      setDeleteError(err?.response?.data?.message || err?.message || "An unexpected error occurred. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Recurring KPI Cards (Matching Overview design system) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Monthly Subscription Costs */}
        <div className="bg-surface-1 border border-border-default rounded-xl p-5 shadow-elevation-sm min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-secondary">
              Monthly Subscription Costs
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/40 dark:text-blue-400 shrink-0">
              <Radio className="h-4 w-4" />
            </div>
          </div>
          <p className="text-[22px] sm:text-[26px] font-bold text-text-primary font-mono mt-2 leading-tight truncate">
            <AnimatedCounter value={monthlyBurn} prefix={currencySymbol} />
          </p>
          <p className="text-xs text-text-secondary font-normal mt-0.5">
            Recurring monthly commitments
          </p>
        </div>

        {/* Projected Annual Burn */}
        <div className="bg-surface-1 border border-border-default rounded-xl p-5 shadow-elevation-sm min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-secondary">
              Annual Projected Costs
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800/40 dark:text-indigo-400 shrink-0">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-[22px] sm:text-[26px] font-bold text-text-primary font-mono mt-2 leading-tight truncate">
            <AnimatedCounter value={annualBurn} prefix={currencySymbol} />
          </p>
          <p className="text-xs text-text-secondary font-normal mt-0.5">
            12-month recurring projection
          </p>
        </div>

        {/* Imminent Renewals Alert */}
        <div className="bg-surface-1 border border-border-default rounded-xl p-5 shadow-elevation-sm min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-secondary">
              Renewals in &le; 3 Days
            </span>
            <div className={`p-1.5 rounded-lg border shrink-0 ${
              imminentRenewals.length > 0 
                ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800/40 dark:text-rose-400' 
                : 'bg-surface-2 border-border-default/60 text-text-secondary'
            }`}>
              <Bell className="h-4 w-4" />
            </div>
          </div>
          <p className={`text-[22px] sm:text-[26px] font-bold font-mono mt-2 leading-tight truncate ${
            imminentRenewals.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-text-primary'
          }`}>
            {imminentRenewals.length}
          </p>
          <p className="text-xs text-text-secondary font-normal mt-0.5">
            {imminentRenewals.length > 0 ? "Upcoming renewals requiring funds" : "No renewals due in next 72h"}
          </p>
        </div>
      </div>

      {/* Imminent Alert Notice */}
      {imminentRenewals.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/40 flex items-center justify-between gap-3 shadow-elevation-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100 border border-rose-300 text-rose-600 dark:bg-rose-900/30 dark:border-rose-800/40 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
            </div>
            <div>
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Notice: {imminentRenewals.length} subscription{imminentRenewals.length > 1 ? 's' : ''} renew within 3 days
              </p>
              <p className="text-xs text-text-primary font-normal mt-0.5">
                Total debit: <span className="text-text-primary font-mono font-semibold">{currencySymbol}{formatNumber(imminentRenewals.reduce((a, b) => a + b.amount, 0), currencySymbol)}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Subscriptions Grid Card */}
      <div className="bg-surface-1 border border-border-default rounded-xl p-5 sm:p-6 shadow-elevation-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle mb-5">
          <div>
            <h2 className="text-[17px] font-bold text-text-primary tracking-tight flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-text-secondary shrink-0" />
              <span>Active Subscriptions ({recurringSubscriptions.length})</span>
            </h2>
            <p className="text-xs text-text-secondary font-normal mt-0.5">
              Automated renewal detection and cycle countdown
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-elevation-sm cursor-pointer w-full sm:w-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Recurring Bill</span>
          </button>
        </div>

        {recurringSubscriptions.length === 0 ? (
          <div className="py-14 text-center text-text-muted text-xs space-y-1.5">
            <Radio className="h-6 w-6 text-text-disabled mx-auto" />
            <p className="font-semibold text-text-primary">No active subscriptions tracked</p>
            <p className="text-text-muted max-w-sm mx-auto">
              When adding transactions, mark "Recurring" or type e.g. "Netflix monthly 15.99 subscription" in Quick Add to track them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recurringSubscriptions.map((sub) => {
              const days = sub.daysUntilRenewal
              const isUrgent = days <= 3
              const brand = getSubscriptionBrand(sub.title, sub.category)
              const categoryStyle = getCategoryStyle(sub.category)

              return (
                <div
                  key={sub._id || sub.id}
                  className="bg-surface-inset border border-border-subtle hover:border-border-strong rounded-xl p-4 sm:p-5 transition-colors flex flex-col justify-between min-h-[145px]"
                >
                  {/* Top Row: Logo + Title/Category + Recurring Badge & Delete Action */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Logo Container (matches standard squircle container) */}
                      <div className="h-10 w-10 rounded-xl bg-surface-2 border border-border-default/60 flex items-center justify-center shrink-0">
                        {brand.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-text-primary truncate">
                          {sub.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${categoryStyle.badge}`}>
                            {sub.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Recurring Badge & Delete Action */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-badge font-semibold uppercase font-mono-nums bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40 shrink-0">
                        <Repeat className="h-2.5 w-2.5" /> RECURRING
                      </span>
                      {onDelete && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteError(null)
                            setSubscriptionToDelete(sub)
                          }}
                          className="p-1.5 rounded-lg text-text-muted hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-800/40 transition-colors cursor-pointer"
                          aria-label="Delete subscription"
                          title="Delete subscription"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Renewal Countdown & Amount */}
                  <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                    {/* Renewal Timing */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className={`h-1.5 w-1.5 rounded-full ${isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <span className={isUrgent ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-text-secondary'}>
                        {sub.nextBillingDate}
                      </span>
                      <span className={isUrgent ? 'text-rose-600/80 dark:text-rose-400/80 font-medium' : 'text-text-muted'}>
                        · {days === 0 ? "Today" : `In ${days}d`}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-[18px] font-bold text-text-primary font-mono">
                        {currencySymbol}{formatNumber(sub.amount, currencySymbol, 2, 2)}
                      </span>
                      <span className="text-xs text-text-secondary font-normal">/month</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete Subscription Confirmation Dialog */}
      <Dialog 
        open={Boolean(subscriptionToDelete)} 
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setSubscriptionToDelete(null)
            setDeleteError(null)
          }
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[440px] p-5 sm:p-6 bg-surface-2 border-border-default shadow-elevation-modal">
          <DialogHeader className="gap-2 text-left sm:text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-text-primary">
                  Delete subscription?
                </DialogTitle>
                <p className="text-xs text-text-secondary mt-0.5">
                  Confirm permanent removal
                </p>
              </div>
            </div>
            <DialogDescription className="text-xs sm:text-sm text-text-secondary pt-1 leading-relaxed">
              Do you want to permanently remove this subscription?
            </DialogDescription>
          </DialogHeader>

          {subscriptionToDelete && (
            <div className="p-3.5 rounded-xl bg-surface-3 border border-border-default/80 flex items-center justify-between gap-3">
              <div className="min-w-0 flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-surface-2 border border-border-default/60 flex items-center justify-center shrink-0">
                  {getSubscriptionBrand(subscriptionToDelete.title, subscriptionToDelete.category).icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {subscriptionToDelete.title}
                  </p>
                  <p className="text-xs text-text-muted">
                    {subscriptionToDelete.category}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-text-primary font-mono">
                  {currencySymbol}{formatNumber(subscriptionToDelete.amount, currencySymbol, 2, 2)}
                </p>
                <p className="text-[11px] text-text-muted">/month</p>
              </div>
            </div>
          )}

          <p className="text-xs text-text-muted leading-relaxed">
            This action cannot be undone. Deleting this subscription will permanently remove the associated recurring transaction.
          </p>

          {deleteError && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!isDeleting) {
                  setSubscriptionToDelete(null)
                  setDeleteError(null)
                }
              }}
              disabled={isDeleting}
              className="w-full sm:w-auto h-9 text-xs sm:text-sm font-medium border-border-default hover:bg-surface-3 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto h-9 text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white border-0 shadow-elevation-sm cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

