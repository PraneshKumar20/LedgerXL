import { useState, useMemo } from "react"
import { formatNumber } from "../../utils/formatUtils"
import { motion as Motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { 
  Target, Plus, Trash2, 
  Trophy, Calendar, DollarSign, X, 
  PartyPopper
} from "lucide-react"
import AnimatedCounter from "../ui/AnimatedCounter"

const EMOJI_OPTIONS = ["🛡️", "✈️", "💻", "🚗", "🏠", "🎓", "💎", "🎁", "🌴", "⚡"]
const COLOR_THEMES = [
  { name: "Emerald", bar: "bg-emerald-500", border: "border-emerald-500/20", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  { name: "Sapphire", bar: "bg-brand", border: "border-brand/20", text: "text-brand", bg: "bg-brand/10" },
  { name: "Amber", bar: "bg-amber-500", border: "border-amber-500/20", text: "text-amber-400", bg: "bg-amber-500/10" },
  { name: "Sky", bar: "bg-sky-500", border: "border-sky-500/20", text: "text-sky-400", bg: "bg-sky-500/10" },
  { name: "Rose", bar: "bg-rose-500", border: "border-rose-500/20", text: "text-rose-400", bg: "bg-rose-500/10" }
]

export default function SavingsGoalsModal({
  isOpen,
  onClose,
  savingsGoals = [],
  onUpdateGoals,
  currencySymbol = "₹",
  multiplier = 1
}) {
  const [isCreating, setIsCreating] = useState(false)
  const [depositModalGoal, setDepositModalGoal] = useState(null)
  const [depositAmount, setDepositAmount] = useState("")
  
  // New Goal Form State
  const [newTitle, setNewTitle] = useState("")
  const [newTarget, setNewTarget] = useState("")
  const [newCurrent, setNewCurrent] = useState("")
  const [newDate, setNewDate] = useState("")
  const [newEmoji, setNewEmoji] = useState("🎯")
  const [newColor] = useState(0)

  // Overall statistics
  const stats = useMemo(() => {
    const totalTarget = savingsGoals.reduce((sum, g) => sum + (Number(g.targetAmount) || 0), 0)
    const totalSaved = savingsGoals.reduce((sum, g) => sum + (Number(g.currentAmount) || 0), 0)
    const totalRemaining = Math.max(0, totalTarget - totalSaved)
    const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0
    const completedCount = savingsGoals.filter(g => (Number(g.currentAmount) || 0) >= (Number(g.targetAmount) || 1)).length

    return { totalTarget, totalSaved, totalRemaining, overallProgress, completedCount }
  }, [savingsGoals])

  // Fire celebratory fireworks confetti
  const triggerCelebration = () => {
    const duration = 2.5 * 1000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 }
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 }
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }

  // Create new Goal
  const handleCreateGoal = (e) => {
    e.preventDefault()
    if (!newTitle.trim() || !newTarget || Number(newTarget) <= 0) return

    const baseTarget = Number(newTarget) / multiplier
    const baseCurrent = (Number(newCurrent) || 0) / multiplier

    const newGoal = {
      id: `goal_${Date.now()}`,
      title: newTitle.trim(),
      targetAmount: baseTarget,
      currentAmount: baseCurrent,
      targetDate: newDate || null,
      emoji: newEmoji,
      colorIndex: newColor,
      createdAt: new Date().toISOString()
    }

    onUpdateGoals([...savingsGoals, newGoal])

    // Reset Form
    setNewTitle("")
    setNewTarget("")
    setNewCurrent("")
    setNewDate("")
    setIsCreating(false)

    // Check if created already completed
    if (baseCurrent >= baseTarget) {
      triggerCelebration()
    }
  }

  // Delete Goal
  const handleDeleteGoal = (goalId) => {
    onUpdateGoals(savingsGoals.filter(g => g.id !== goalId))
  }

  // Quick Deposit inside modal
  const handleQuickDeposit = (amount) => {
    if (!depositModalGoal || !amount || Number(amount) <= 0) return

    const num = Number(amount) / multiplier
    let hitTarget = false

    const updated = savingsGoals.map(g => {
      if (g.id === depositModalGoal.id) {
        const next = (Number(g.currentAmount) || 0) + num
        if (next >= (Number(g.targetAmount) || 1) && (Number(g.currentAmount) || 0) < (Number(g.targetAmount) || 1)) {
          hitTarget = true
        }
        return { ...g, currentAmount: next }
      }
      return g
    })

    if (hitTarget) {
      triggerCelebration()
    }

    onUpdateGoals(updated)
    setDepositAmount("")
    setDepositModalGoal(null)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-surface-overlay backdrop-blur-sm"
          />

          {/* Modal Container */}
          <Motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-2xl bg-surface-2 border border-border-default rounded-modal shadow-elevation-modal overflow-hidden z-10 max-h-[90dvh] flex flex-col"
          >
            {/* Header (Pinned) */}
            <div className="flex items-start justify-between p-4 sm:p-6 border-b border-border-default/60 bg-surface-2 shrink-0 gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-control bg-positive/10 text-positive border border-positive/20 shadow-elevation-sm shrink-0">
                    <Target className="h-4 w-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight truncate">
                    Savings Goals & Milestones
                  </h2>
                </div>
                <p className="text-xs text-text-secondary font-normal pl-8 sm:pl-9 truncate">
                  Track target funds, allocate savings, and unlock milestone celebrations.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreating(!isCreating)}
                  className="px-3 py-1.5 rounded-control bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-elevation-sm cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isCreating ? "Cancel" : "New Goal"}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-control bg-surface-3 hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-5">
              {/* Summary Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-card bg-surface-1 border border-border-default space-y-1">
                <p className="text-[11px] uppercase font-semibold tracking-[0.06em] text-text-muted flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-positive" />
                  Total Saved
                </p>
                <div className="text-xl font-semibold text-positive font-mono-nums">
                  <AnimatedCounter value={stats.totalSaved * multiplier} prefix={currencySymbol} />
                </div>
                <p className="text-xs text-text-secondary font-normal">Across {savingsGoals.length} targets</p>
              </div>

              <div className="p-3.5 rounded-card bg-surface-1 border border-border-default space-y-1">
                <p className="text-[11px] uppercase font-semibold tracking-[0.06em] text-text-muted flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-brand" />
                  Target Goal
                </p>
                <div className="text-xl font-semibold text-text-primary font-mono-nums">
                  <AnimatedCounter value={stats.totalTarget * multiplier} prefix={currencySymbol} />
                </div>
                <p className="text-xs text-text-secondary font-normal font-mono-nums">
                  {currencySymbol}{formatNumber(Math.round(stats.totalRemaining * multiplier), currencySymbol, 0, 0)} to go
                </p>
              </div>

              <div className="p-3.5 rounded-card bg-surface-1 border border-border-default space-y-1">
                <p className="text-[11px] uppercase font-semibold tracking-[0.06em] text-text-muted flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-warning" />
                  Milestone Progress
                </p>
                <div className="text-xl font-semibold text-warning font-mono-nums">
                  {stats.overallProgress}%
                </div>
                <p className="text-xs text-text-secondary font-normal">{stats.completedCount} reached 100%</p>
              </div>
            </div>

            {/* New Goal Creator Inline Form */}
            <AnimatePresence>
              {isCreating && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateGoal}
                  className="p-4 rounded-card bg-surface-1 border border-border-default space-y-3 overflow-hidden"
                >
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-positive" /> Define New Financial Milestone
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-text-secondary font-medium">Goal Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Emergency Fund, Japan Trip"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 rounded-control bg-surface-3 border border-border-default text-text-primary text-xs outline-none focus-ring"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-text-secondary font-medium">Target Amount ({currencySymbol})</label>
                      <input
                        type="number"
                        placeholder="5000"
                        value={newTarget}
                        onChange={e => setNewTarget(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 rounded-control bg-surface-3 border border-border-default text-text-primary text-xs outline-none focus-ring"
                        required
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-text-secondary font-medium">Initial Amount Saved ({currencySymbol})</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newCurrent}
                        onChange={e => setNewCurrent(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 rounded-control bg-surface-3 border border-border-default text-text-primary text-xs outline-none focus-ring"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-text-secondary font-medium">Target Completion Date (Optional)</label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={e => setNewDate(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 rounded-control bg-surface-3 border border-border-default text-text-primary text-xs outline-none focus-ring"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    {/* Emoji picker */}
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[11px] text-text-secondary mr-1">Icon:</span>
                      {EMOJI_OPTIONS.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewEmoji(emoji)}
                          className={`p-1 text-sm rounded-control transition-all ${newEmoji === emoji ? 'bg-brand/20 border border-brand text-text-primary' : 'hover:bg-surface-hover opacity-70'}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-control bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-medium text-xs transition-colors shadow-elevation-sm cursor-pointer"
                    >
                      Save Target Goal
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Goals List */}
            <div className="space-y-3">
              {savingsGoals.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="p-3 rounded-control bg-surface-3 border border-border-default inline-block text-text-muted">
                    <Target className="h-6 w-6 mx-auto stroke-1" />
                  </div>
                  <p className="text-text-secondary text-sm font-medium">No savings goals created yet.</p>
                  <p className="text-text-muted text-xs">Click "New Goal" above to create your first milestone.</p>
                </div>
              ) : (
                savingsGoals.map(goal => {
                  const target = Number(goal.targetAmount) || 1
                  const current = Number(goal.currentAmount) || 0
                  const progress = Math.min(100, Math.round((current / target) * 100))
                  const isComplete = progress >= 100
                  const theme = COLOR_THEMES[goal.colorIndex || 0] || COLOR_THEMES[0]

                  return (
                    <Motion.div
                      key={goal.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`p-4 rounded-card bg-surface-1 border ${isComplete ? 'border-positive/30 bg-positive/[0.02]' : 'border-border-default'} hover:border-border-strong transition-colors space-y-3 group`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="text-xl p-2 rounded-control bg-surface-3 border border-border-default shrink-0">
                            {goal.emoji || "🎯"}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-semibold text-text-primary tracking-wide truncate">
                                {goal.title}
                              </h4>
                              {isComplete && (
                                <span className="px-2 py-0.5 rounded-badge text-[10px] font-semibold bg-positive/10 text-positive border border-positive/20 flex items-center gap-1 shrink-0">
                                  <PartyPopper className="h-3 w-3" /> Reached 100%
                                </span>
                              )}
                            </div>
                            {goal.targetDate && (
                              <p className="text-[10px] text-text-secondary flex items-center gap-1 mt-0.5 font-mono">
                                <Calendar className="h-3 w-3 text-text-muted shrink-0" />
                                <span>Target Date: {new Date(goal.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setDepositModalGoal(goal)
                              setDepositAmount("100")
                            }}
                            className="px-2.5 py-1 rounded-control bg-brand hover:bg-brand-hover active:bg-brand-active text-white text-xs font-medium flex items-center gap-1 transition-colors shadow-elevation-sm cursor-pointer"
                            title="Add money to this goal"
                          >
                            <Plus className="h-3 w-3" /> Deposit
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-1.5 rounded-control text-text-muted hover:text-negative hover:bg-negative/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Delete goal"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar with milestones */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono-nums">
                          <span className="text-text-primary font-semibold">
                            {currencySymbol}{formatNumber(Math.round(current * multiplier), currencySymbol, 0, 0)}
                          </span>
                          <span className="text-text-secondary">
                            {progress}% of {currencySymbol}{formatNumber(Math.round(target * multiplier), currencySymbol, 0, 0)}
                          </span>
                        </div>

                        <div className="relative h-2 w-full bg-surface-inset rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full ${isComplete ? 'bg-positive' : theme.bar}`}
                          />
                        </div>

                        {/* Milestone indicators */}
                        <div className="flex justify-between text-[10px] text-text-muted font-mono-nums px-0.5">
                          <span>0%</span>
                          <span>25%</span>
                          <span>50%</span>
                          <span>75%</span>
                          <span className={isComplete ? "text-positive font-semibold" : ""}>100%</span>
                        </div>
                      </div>
                    </Motion.div>
                  )
                })
              )}
            </div>
            </div>

            {/* Quick Deposit Modal Popup */}
            <AnimatePresence>
              {depositModalGoal && (
                <div className="absolute inset-0 z-20 bg-surface-overlay backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
                  <Motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-sm bg-surface-2 border border-border-default rounded-card p-5 space-y-4 shadow-elevation-modal max-h-[90dvh] overflow-y-auto overscroll-contain"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{depositModalGoal.emoji}</span>
                        <h4 className="text-sm font-semibold text-text-primary">Deposit to {depositModalGoal.title}</h4>
                      </div>
                      <button onClick={() => setDepositModalGoal(null)} className="text-text-secondary hover:text-text-primary cursor-pointer">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-text-secondary font-medium">Enter Amount ({currencySymbol})</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-text-muted font-mono">{currencySymbol}</span>
                        <input
                          type="number"
                          autoFocus
                          value={depositAmount}
                          onChange={e => setDepositAmount(e.target.value)}
                          placeholder="100"
                          className="w-full pl-8 pr-3 py-1.5 rounded-control bg-surface-3 border border-border-default text-text-primary font-mono-nums text-sm outline-none focus-ring"
                        />
                      </div>

                      {/* Quick preset chips */}
                      <div className="flex items-center gap-2 pt-1">
                        {[25, 50, 100, 250, 500].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setDepositAmount(String(val))}
                            className="flex-1 py-1 rounded-control bg-surface-3 hover:bg-surface-hover text-[11px] font-mono-nums text-text-secondary hover:text-text-primary border border-border-subtle transition-colors cursor-pointer"
                          >
                            +{val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => setDepositModalGoal(null)}
                        className="flex-1 py-1.5 rounded-control bg-surface-3 hover:bg-surface-hover text-text-secondary text-xs font-medium transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleQuickDeposit(depositAmount)}
                        className="flex-1 py-1.5 rounded-control bg-brand hover:bg-brand-hover active:bg-brand-active text-white text-xs font-semibold transition-colors shadow-elevation-sm cursor-pointer"
                      >
                        Confirm Deposit
                      </button>
                    </div>
                  </Motion.div>
                </div>
              )}
            </AnimatePresence>
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
