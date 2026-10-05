import { useState, useEffect } from "react"
import { formatNumber } from "../../utils/formatUtils"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select"
import { Pencil, Repeat, AlertCircle } from "lucide-react"

const CATEGORIES = [
  "Food", 
  "Travel", 
  "Bills", 
  "Subscriptions", 
  "Entertainment", 
  "Shopping", 
  "Salary", 
  "Other"
]

export default function TransactionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingTransaction = null,
  currencySymbol = "₹"
}) {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Food",
    type: "expense",
    date: new Date().toISOString().slice(0, 10),
    isRecurring: false
  })
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        title: editingTransaction.title || "",
        amount: editingTransaction.amount || "",
        category: editingTransaction.category || "Food",
        type: editingTransaction.type || "expense",
        date: editingTransaction.date 
          ? new Date(editingTransaction.date).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        isRecurring: !!editingTransaction.isRecurring
      })
    } else {
      setFormData({
        title: "",
        amount: "",
        category: "Food",
        type: "expense",
        date: new Date().toISOString().slice(0, 10),
        isRecurring: false
      })
    }
    setError(null)
  }, [editingTransaction, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError("Please enter a description.")
      return
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Enter a valid amount.")
      return
    }
    if (!formData.category) {
      setError("Please select a category.")
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      await onSave({
        ...editingTransaction,
        ...formData,
        amount: Number(formData.amount)
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Derived values for preview
  const displayAmount = formData.amount ? formatNumber(Number(formData.amount), currencySymbol) : '0.00'
  const isIncome = formData.type === 'income'
  const amountColor = isIncome ? 'text-positive' : 'text-text-primary'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose(open)}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-[460px] bg-surface-2 border border-border-default text-text-primary rounded-modal shadow-elevation-modal p-0 overflow-hidden max-h-[90dvh] flex flex-col">
        
        {/* Header */}
        <DialogHeader className="pt-5 px-5 pb-4 border-b border-border-default bg-surface-1/60 shrink-0">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-control bg-brand/10 text-brand mt-0.5 shadow-elevation-sm">
              <Pencil className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-text-primary tracking-tight">
                {editingTransaction ? "Edit Transaction" : "New Transaction"}
              </DialogTitle>
              <DialogDescription className="text-text-secondary text-xs font-medium mt-1 leading-relaxed">
                Log financial flows directly to your ledger.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-6">
          
          {/* Main Form Fields */}
          <div className="space-y-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted mb-1 px-0.5">
              Transaction Details
            </div>
            
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-control bg-negative/10 border border-negative/20 text-negative text-xs font-medium">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-medium text-text-secondary">
                Description / Payee
              </Label>
              <Input 
                id="title" 
                placeholder="e.g. AWS Cloud or Freelance" 
                value={formData.title} 
                onChange={(e) => {
                  setFormData({...formData, title: e.target.value})
                  if (error) setError(null)
                }} 
                className="bg-surface-3 border-border-default focus-ring text-text-primary text-sm h-11 px-3.5 rounded-control shadow-elevation-sm transition-all placeholder:text-text-muted" 
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="amount" className="text-xs font-medium text-text-secondary">
                  Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-medium">{currencySymbol}</span>
                  <Input 
                    id="amount" 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={formData.amount} 
                    onChange={(e) => {
                      setFormData({...formData, amount: e.target.value})
                      if (error) setError(null)
                    }} 
                    className={`bg-surface-3 border-border-default focus-ring font-mono-nums text-base font-semibold h-11 pl-8 rounded-control shadow-elevation-sm transition-all ${amountColor}`} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-text-secondary">
                  Type
                </Label>
                <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                  <SelectTrigger className="bg-surface-3 border-border-default focus-ring text-text-primary font-medium text-sm h-11 rounded-control shadow-elevation-sm transition-all">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-2 border-border-default text-text-primary shadow-elevation-md rounded-control">
                    <SelectItem value="expense" className="text-negative font-medium focus:bg-negative/10 focus:text-negative cursor-pointer">Expense (-)</SelectItem>
                    <SelectItem value="income" className="text-positive font-medium focus:bg-positive/10 focus:text-positive cursor-pointer">Income (+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-text-secondary">
                  Category
                </Label>
                <Select value={formData.category} onValueChange={(val) => {
                  setFormData({...formData, category: val, isRecurring: val === 'Subscriptions' ? true : formData.isRecurring})
                  if (error) setError(null)
                }}>
                  <SelectTrigger className="bg-surface-3 border-border-default focus-ring text-text-primary text-sm h-11 rounded-control shadow-elevation-sm transition-all">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-2 border-border-default text-text-primary shadow-elevation-md rounded-control">
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat} className="focus:bg-surface-hover cursor-pointer">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-xs font-medium text-text-secondary">
                  Date
                </Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({...formData, date: e.target.value})} 
                  className="bg-surface-3 border-border-default focus-ring text-text-primary text-sm h-11 px-3.5 rounded-control shadow-elevation-sm transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Recurring Control */}
          <div className="pt-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted mb-3 px-0.5">
              Optional
            </div>
            
            <button
              type="button"
              onClick={() => setFormData(prev => ({...prev, isRecurring: !prev.isRecurring}))}
              className={`w-full flex items-center justify-between p-3.5 rounded-card border transition-all duration-200 cursor-pointer outline-none focus-ring ${
                formData.isRecurring 
                  ? 'bg-positive/10 border-positive/30' 
                  : 'bg-surface-1 border-border-default hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-control transition-colors ${formData.isRecurring ? 'bg-positive/20 text-positive' : 'bg-surface-3 text-text-secondary'}`}>
                  <Repeat className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className={`text-sm font-semibold transition-colors ${formData.isRecurring ? 'text-positive' : 'text-text-primary'}`}>
                    Recurring Transaction
                  </span>
                  <span className="text-[11px] text-text-muted font-medium mt-0.5">Mark as periodic repeating cashflow</span>
                </div>
              </div>
              
              <div className={`px-2.5 py-1 rounded-badge text-[10px] font-bold tracking-wider transition-colors ${
                formData.isRecurring
                  ? 'bg-positive text-white shadow-elevation-sm'
                  : 'bg-surface-3 text-text-muted'
              }`}>
                {formData.isRecurring ? 'ON' : 'OFF'}
              </div>
            </button>
          </div>
          
          {/* Contextual Preview (only if title or amount entered) */}
          {(formData.title || formData.amount) && (
            <div className="pt-2">
              <div className="p-4 rounded-card border border-border-default bg-surface-1 flex items-center justify-between shadow-elevation-sm">
                <div className="min-w-0 pr-4">
                  <h4 className="text-sm font-semibold text-text-primary truncate">{formData.title || "New Transaction"}</h4>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-medium text-text-muted">
                    {formData.category && <span>{formData.category}</span>}
                    {formData.category && formData.type && <span>·</span>}
                    {formData.type && <span className={isIncome ? 'text-positive' : 'text-negative'}>{isIncome ? 'Income' : 'Expense'}</span>}
                  </div>
                </div>
                <div className={`text-base font-bold font-mono-nums tracking-tight whitespace-nowrap ${amountColor}`}>
                  {isIncome ? '+' : '-'}{currencySymbol}{displayAmount}
                </div>
              </div>
            </div>
          )}
          </div>

          {/* Save / Cancel Footer */}
          <DialogFooter className="px-5 py-4 border-t border-border-default bg-surface-1/40 shrink-0 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 sm:gap-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="w-full sm:w-auto text-text-secondary hover:text-text-primary hover:bg-surface-hover text-sm font-medium h-10 px-4 rounded-control transition-colors flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-semibold text-sm h-10 px-5 rounded-control shadow-elevation-sm transition-all disabled:opacity-50 flex-1 sm:flex-none"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
          
        </form>
      </DialogContent>
    </Dialog>
  )
}
