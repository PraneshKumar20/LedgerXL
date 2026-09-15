import { Plus, Receipt, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import TransactionTable from "./TransactionTable"
import AnimatedCounter from "../ui/AnimatedCounter"

export default function TransactionsView({
  transactions = [],
  onEdit,
  onDelete,
  currencySymbol = "₹",
  onOpenAddModal,
  totalIncome,
  totalExpense,
  balance
}) {
  return (
    <div className="space-y-5">
      {/* Top Ledger Snapshot Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Records */}
        <div className="bg-surface-1 border border-border-default rounded-xl p-4 shadow-elevation-sm hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-secondary">Total Entries</span>
            <div className="p-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40">
              <Receipt className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-[20px] sm:text-[26px] font-semibold text-text-primary font-mono mt-1">{transactions.length}</p>
          <p className="text-xs text-text-secondary font-normal mt-0.5">Recorded in journal</p>
        </div>

        {/* Total Inflow */}
        <div className="bg-surface-1 border border-border-default rounded-xl p-4 shadow-elevation-sm hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-secondary">Total Inflow</span>
            <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-[20px] sm:text-[26px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono mt-1 leading-tight">
            <AnimatedCounter value={totalIncome} prefix={currencySymbol} />
          </p>
          <p className="text-xs text-text-secondary font-normal mt-0.5">All credited income</p>
        </div>

        {/* Total Outflow */}
        <div className="bg-surface-1 border border-border-default rounded-xl p-4 shadow-elevation-sm hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-secondary">Total Outflow</span>
            <div className="p-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40">
              <TrendingDown className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-[20px] sm:text-[26px] font-semibold text-rose-600 dark:text-rose-400 font-mono mt-1 leading-tight">
            <AnimatedCounter value={totalExpense} prefix={currencySymbol} />
          </p>
          <p className="text-xs text-text-secondary font-normal mt-0.5">All debited expenses</p>
        </div>

        {/* Net Cashflow */}
        <div className="bg-surface-1 border border-border-default rounded-xl p-4 shadow-elevation-sm hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-secondary">Net Surplus</span>
            <div className="p-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40">
              <Wallet className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className={`text-[20px] sm:text-[26px] font-semibold font-mono mt-1 leading-tight ${balance >= 0 ? 'text-text-primary' : 'text-rose-600 dark:text-rose-400'}`}>
            <AnimatedCounter value={balance} prefix={currencySymbol} />
          </p>
          <p className="text-xs text-text-secondary font-normal mt-0.5">Surplus retention</p>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-surface-1 border border-border-default rounded-xl p-5 shadow-elevation-sm">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-3">
          <div>
            <h2 className="text-[16px] font-bold text-text-primary tracking-tight">
              Ledger Journal
            </h2>
            <p className="text-xs text-text-secondary font-normal mt-0.5">Search, filter, and inspect financial transactions</p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-elevation-sm cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Entry</span>
          </button>
        </div>

        <TransactionTable
          transactions={transactions}
          onEdit={onEdit}
          onDelete={onDelete}
          currencySymbol={currencySymbol}
        />
      </div>
    </div>
  )
}
