import { useState, useMemo } from "react"
import { formatNumber } from "../../utils/formatUtils"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../ui/table"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select"
import { 
  Search, 
  Edit2, 
  Trash2, 
  Download, 
  Repeat, 
  ArrowUpDown, 
  X,
  Calendar
} from "lucide-react"

import { getCategoryStyle } from "../../utils/categoryColors"

export default function TransactionTable({ transactions = [], onEdit, onDelete, currencySymbol = "₹" }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("desc")
  const [filterType, setFilterType] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")

  // Extract unique categories for filter dropdown
  const categories = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : []
    const cats = new Set(list.map(t => t.category).filter(Boolean))
    return Array.from(cats)
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : []
    return list.filter(t => {
      const title = (t.title || "").toLowerCase()
      const cat = (t.category || "").toLowerCase()
      const search = searchTerm.toLowerCase()
      const matchesSearch = title.includes(search) || cat.includes(search)
      const matchesType = filterType === "all" ? true : t.type === filterType
      const matchesCategory = filterCategory === "all" ? true : t.category === filterCategory
      return matchesSearch && matchesType && matchesCategory
    }).sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    })
  }, [transactions, searchTerm, filterType, filterCategory, sortOrder])

  const { filteredIncome, filteredExpense } = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, curr) => {
        if (curr.type === 'income') acc.filteredIncome += curr.amount
        else acc.filteredExpense += curr.amount
        return acc
      },
      { filteredIncome: 0, filteredExpense: 0 }
    )
  }, [filteredTransactions])

  const exportCSV = () => {
    const headers = ["Title", "Category", "Type", "Amount", "Date", "Recurring"]
    const rows = filteredTransactions.map(t => [
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.type,
      t.amount,
      new Date(t.date).toISOString().slice(0, 10),
      t.isRecurring ? "Yes" : "No"
    ])
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `ledger_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setFilterType("all")
    setFilterCategory("all")
  }

  return (
    <div className="space-y-3">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            placeholder="Search transactions, payees, categories..."
            className="pl-10 pr-10 bg-surface-3 border-border-default text-[13px] text-text-primary placeholder:text-text-muted h-10 rounded-control focus-ring shadow-elevation-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Controls & CSV Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Type Filter */}
          <div className="bg-surface-2 rounded-control border border-border-default flex items-center shadow-elevation-sm">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[110px] border-0 bg-transparent h-10 px-3.5 text-[13px] font-medium text-text-primary focus:ring-0 cursor-pointer">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-surface-2 border-border-default text-text-primary text-sm shadow-elevation-md rounded-control">
                <SelectItem value="all" className="cursor-pointer">All Types</SelectItem>
                <SelectItem value="income" className="cursor-pointer">Income</SelectItem>
                <SelectItem value="expense" className="cursor-pointer">Expense</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-px h-5 bg-border-subtle" />

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[140px] border-0 bg-transparent h-10 px-3.5 text-[13px] font-medium text-text-primary focus:ring-0 cursor-pointer">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-surface-2 border-border-default text-text-primary text-sm shadow-elevation-md rounded-control">
                <SelectItem value="all" className="cursor-pointer">All Categories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c} value={c} className="cursor-pointer">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Sort Toggle */}
          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="h-10 px-3.5 bg-surface-2 border-border-default hover:bg-surface-hover hover:border-border-strong text-[13px] font-medium text-text-primary rounded-control shadow-elevation-sm transition-all"
            title="Toggle sort order"
          >
            <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-text-secondary" />
            <span>{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
          </Button>

          {/* Export CSV */}
          <Button
            variant="outline"
            onClick={exportCSV}
            className="h-10 px-4 bg-surface-3 border-border-default hover:bg-surface-hover hover:border-border-strong text-[13px] font-semibold text-text-primary rounded-control shadow-elevation-sm transition-all flex items-center"
          >
            <Download className="h-4 w-4 mr-2 text-brand" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Filter Summary Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-control bg-surface-2/60 border border-border-default text-xs text-text-secondary">
        <div className="flex items-center gap-3">
          <span>Showing <strong className="text-text-primary font-mono">{filteredTransactions.length}</strong> of {transactions.length} entries</span>
          {(searchTerm || filterType !== "all" || filterCategory !== "all") && (
            <button
              onClick={resetFilters}
              className="text-[11px] text-brand hover:text-brand-hover underline cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 font-mono-nums text-[11px]">
          <span className="text-positive font-semibold">
            +{currencySymbol}{formatNumber(filteredIncome, currencySymbol)}
          </span>
          <span className="text-negative font-semibold">
            -{currencySymbol}{formatNumber(filteredExpense, currencySymbol)}
          </span>
        </div>
      </div>

      {/* Responsive View: Desktop Table (>= 768px) */}
      <div className="hidden md:block rounded-card border border-border-default bg-surface-1 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border-default bg-surface-2/60">
              <TableHead className="font-semibold text-[11px] uppercase tracking-[0.06em] text-text-muted py-3 pl-5">
                Description / Title
              </TableHead>
              <TableHead className="font-semibold text-[11px] uppercase tracking-[0.06em] text-text-muted py-3">
                Category
              </TableHead>
              <TableHead className="font-semibold text-[11px] uppercase tracking-[0.06em] text-text-muted py-3">
                Date
              </TableHead>
              <TableHead className="font-semibold text-[11px] uppercase tracking-[0.06em] text-text-muted py-3 text-right">
                Amount
              </TableHead>
              <TableHead className="font-semibold text-[11px] uppercase tracking-[0.06em] text-text-muted py-3 text-right pr-5">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-36 text-center">
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <Search className="h-5 w-5 text-text-muted" />
                    <p className="font-semibold text-text-primary text-xs">No matching transactions</p>
                    <p className="text-xs text-text-muted font-normal">
                      Try adjusting your search query or reset your filters.
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={resetFilters} 
                      className="mt-1 h-7 text-xs border-border-default bg-surface-2 text-text-secondary hover:text-text-primary"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'income'
                const badgeClass = getCategoryStyle(tx.category).badge

                return (
                  <tr
                    key={tx._id}
                    className="border-b border-border-subtle hover:bg-surface-hover transition-colors group"
                  >
                    {/* Title */}
                    <TableCell className="py-3 pl-5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-text-primary">
                          {tx.title}
                        </span>
                        {tx.isRecurring && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40 px-1.5 py-0.2 rounded-badge font-semibold font-mono-nums uppercase">
                            <Repeat className="h-2.5 w-2.5" /> Recurring
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Category Badge */}
                    <TableCell className="py-3">
                      <span className={`inline-flex items-center rounded-badge border ${badgeClass} px-2 py-0.5 text-[11px] font-medium`}>
                        {tx.category}
                      </span>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="py-3 text-[13px] text-text-secondary font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-text-muted" />
                        <span>
                          {new Date(tx.date).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </TableCell>

                    {/* Amount */}
                    <TableCell className={`py-3 text-right font-mono-nums font-semibold text-[13px] ${isIncome ? 'text-positive' : 'text-negative'}`}>
                      {isIncome ? '+' : '-'}{currencySymbol}{formatNumber(tx.amount, currencySymbol)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3 text-right pr-5">
                      <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(tx)}
                          className="p-1 rounded-control text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(tx._id)}
                          className="p-1 rounded-control text-text-muted hover:text-negative hover:bg-negative/10 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </tr>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Responsive View: Mobile Card List (< 768px) */}
      <div className="block md:hidden space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="p-6 text-center bg-surface-1 rounded-card border border-border-default space-y-1.5">
            <Search className="h-5 w-5 text-text-muted mx-auto" />
            <p className="font-semibold text-text-primary text-xs">No matching transactions</p>
            <Button size="sm" variant="outline" onClick={resetFilters} className="text-xs h-7 border-border-default bg-surface-2 text-text-secondary">
              Reset Filters
            </Button>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'income'
            const badgeClass = getCategoryStyle(tx.category).badge

            return (
              <div
                key={tx._id}
                className="p-3.5 rounded-card bg-surface-1 border border-border-default space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm text-text-primary truncate">{tx.title}</span>
                      {tx.isRecurring && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded-badge font-semibold uppercase font-mono-nums bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40">
                          <Repeat className="h-2.5 w-2.5" /> Recurring
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-badge border ${badgeClass}`}>
                        {tx.category}
                      </span>
                      <span className="flex items-center gap-1 text-[12px] text-text-secondary font-medium">
                        <Calendar className="h-3 w-3 text-text-muted" />
                        {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-mono-nums font-semibold text-[13px] ${isIncome ? 'text-positive' : 'text-negative'}`}>
                      {isIncome ? '+' : '-'}{currencySymbol}{formatNumber(tx.amount, currencySymbol)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-default">
                  <button
                    onClick={() => onEdit(tx)}
                    className="px-2 py-0.5 text-xs font-medium text-text-secondary bg-surface-3 hover:bg-surface-hover rounded-control border border-border-default flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit2 className="h-3 w-3 text-text-secondary" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(tx._id)}
                    className="px-2 py-0.5 text-xs font-medium text-negative bg-negative/10 hover:bg-negative/20 rounded-control border border-negative/20 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="h-3 w-3 text-negative" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
