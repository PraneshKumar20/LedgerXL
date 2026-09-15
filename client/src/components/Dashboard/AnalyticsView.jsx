import { useMemo } from "react"
import { 
  Activity, 
  PieChart as PieIcon, 
  TrendingDown, 
  Percent
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector } from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import FinancialHealthCard from "./FinancialHealthCard"
import AnimatedCounter from "../ui/AnimatedCounter"
import { formatNumber, formatCompactNumber } from "../../utils/formatUtils"
import { getCategoryStyle } from "../../utils/categoryColors"
import { useTheme } from "../../context/ThemeContext"

export default function AnalyticsView({
  totalIncome,
  totalExpense,
  balance,
  budgetLimit,
  multiplier,
  currencySymbol = "₹",
  displayExpenses = [],
  savingsRate = 0,
  avgTransaction = 0,
  topCategory = { name: "None", amount: 0 },
  trendData = [],
  categoryData = [],
  totalCategoryExpense = 0,
  activeCategoryIndex,
  setActiveCategoryIndex,
  renderActiveShape: propRenderActiveShape
}) {
  const { isDark } = useTheme()
  const formatYAxis = (val) => {
    if (val === 0) return '0'
    if (val >= 100000 && currencySymbol === '₹') return `₹${Math.round(val / 100000)}L`
    if (val >= 1000) return `${currencySymbol}${Math.round(val / 1000)}k`
    return `${currencySymbol}${val}`
  }

  const computedCategoryExpense = useMemo(() => {
    return categoryData.reduce((acc, cat) => acc + cat.value, 0)
  }, [categoryData])

  const totalCatExpense = totalCategoryExpense > 0 ? totalCategoryExpense : computedCategoryExpense

  const displayCategories = useMemo(() => {
    if (!categoryData || categoryData.length === 0) return []
    return categoryData.map(cat => ({
      name: cat.name,
      value: cat.value,
      pct: totalCatExpense > 0 ? `${((cat.value / totalCatExpense) * 100).toFixed(1)}%` : "0%",
      color: getCategoryStyle(cat.name).base
    }))
  }, [categoryData, totalCatExpense])

  const renderActiveShape = (props) => {
    if (propRenderActiveShape) return propRenderActiveShape(props)
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
    return (
      <g className="cursor-pointer transition-all duration-300">
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={outerRadius + 3}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.35}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 2}
          outerRadius={outerRadius + 4}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    )
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const inc = payload.find(p => p.dataKey === 'income')?.value || 0
      const exp = payload.find(p => p.dataKey === 'expense')?.value || 0
      const net = inc - exp
      return (
        <div className="bg-surface-1 border border-border-default p-3 rounded-xl shadow-elevation-lg min-w-[160px]">
          <p className="text-text-secondary text-[11px] font-semibold uppercase tracking-wider mb-2">{label}</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="text-text-secondary font-medium">Income</span>
              <span className="text-emerald-400 font-mono font-semibold">{currencySymbol}{formatNumber(inc, currencySymbol, 0, 0)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-text-secondary font-medium">Expense</span>
              <span className="text-rose-400 font-mono font-semibold">{currencySymbol}{formatNumber(exp, currencySymbol, 0, 0)}</span>
            </div>
            <div className="border-t border-border-default pt-1.5 mt-1.5 flex items-center justify-between gap-4">
              <span className="text-text-primary font-medium">Net</span>
              <span className={`font-mono font-bold ${net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {net < 0 ? '-' : '+'}{currencySymbol}{formatNumber(Math.abs(net), currencySymbol, 0, 0)}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-5">
      {/* Top Analytics KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Savings Rate */}
        <div className="bg-surface-1 border border-border-default rounded-xl p-4 shadow-elevation-sm hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-secondary">Savings Rate</span>
            <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
              <Percent className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-[20px] sm:text-[26px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono mt-1 leading-tight">
            <AnimatedCounter value={savingsRate} decimals={1} suffix="%" />
          </p>
          <p className="text-xs text-text-secondary font-normal mt-0.5">Surplus retention ratio</p>
        </div>

        {/* Avg Transaction */}
        <div className="bg-surface-1 border border-border-default rounded-xl p-4 shadow-elevation-sm hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-secondary">Average Expense</span>
            <div className="p-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40">
              <Activity className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-[20px] sm:text-[26px] font-semibold text-text-primary font-mono mt-1 leading-tight">
            <AnimatedCounter value={avgTransaction} prefix={currencySymbol} />
          </p>
          <p className="text-xs text-text-secondary font-normal mt-0.5">Average ticket per expense</p>
        </div>

        {/* Top Outflow Category */}
        <div className="bg-surface-1 border border-border-default rounded-xl p-4 shadow-elevation-sm hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-secondary">Top Expense Category</span>
            <div className="p-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40">
              <TrendingDown className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-[20px] sm:text-[26px] font-semibold text-rose-600 dark:text-rose-400 truncate mt-1 leading-tight">
            {topCategory.name}
          </p>
          <p className="text-xs text-text-secondary font-normal mt-0.5 font-mono">
            {currencySymbol}{formatNumber(topCategory.amount, currencySymbol, 0, 0)} total
          </p>
        </div>

        {/* Category Count */}
        <div className="bg-surface-1 border border-border-default rounded-xl p-4 shadow-elevation-sm hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-secondary">Categories Used</span>
            <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/40">
              <PieIcon className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-[20px] sm:text-[26px] font-semibold text-text-primary font-mono mt-1 leading-tight">
            {displayCategories.length}
          </p>
          <p className="text-xs text-text-secondary font-normal mt-0.5">Active partitions</p>
        </div>
      </div>

      {/* Cashflow Velocity + Donut Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cashflow Velocity */}
        <div className="lg:col-span-2 bg-surface-1 border border-border-default rounded-xl p-5 shadow-elevation-sm">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h2 className="text-[16px] font-bold text-text-primary tracking-tight flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Cashflow Trends</span>
              </h2>
              <p className="text-xs text-text-secondary font-normal mt-0.5">Income vs expense timeline</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-positive" />
                <span className="text-[11px] text-text-secondary font-semibold uppercase tracking-[0.06em]">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-negative" />
                <span className="text-[11px] text-text-secondary font-semibold uppercase tracking-[0.06em]">Expense</span>
              </div>
            </div>
          </div>

          <div className="h-[185px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} vertical={false} opacity={0.7} />
                <XAxis dataKey="date" stroke={isDark ? "#64748B" : "#94a3b8"} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={isDark ? "#64748B" : "#94a3b8"} fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
                <Tooltip 
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.04)' }}
                  content={<CustomTooltip />}
                />
                <Bar 
                  dataKey="income" 
                  fill="#10B981" 
                  radius={[3, 3, 0, 0]} 
                  name="Income" 
                  barSize={16}
                  minPointSize={12}
                />
                <Bar 
                  dataKey="expense" 
                  fill="#F43F5E" 
                  radius={[3, 3, 0, 0]} 
                  name="Expense" 
                  barSize={16}
                  minPointSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart with Centered Animated HUD & Breakdown List */}
        <div className="bg-surface-1 border border-border-default rounded-xl p-5 shadow-elevation-sm flex flex-col justify-between">
          <div className="pb-2 border-b border-border-subtle">
            <h2 className="text-sm font-semibold text-text-primary tracking-tight flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-brand" />
              <span>Category Allocation</span>
            </h2>
            <p className="text-xs text-text-secondary font-normal mt-0.5">Distribution of expenses</p>
          </div>

          {displayCategories.length > 0 ? (
            <div className="space-y-3 pt-2">
              <div className="relative w-full h-[155px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={68}
                      paddingAngle={2}
                      dataKey="value"
                      stroke={isDark ? "#0f1523" : "#ffffff"}
                      strokeWidth={2}
                      activeIndex={activeCategoryIndex !== null ? activeCategoryIndex : -1}
                      activeShape={renderActiveShape}
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={1500}
                      animationEasing="ease-out"
                      onMouseEnter={(_, index) => setActiveCategoryIndex(index)}
                      onMouseLeave={() => setActiveCategoryIndex(null)}
                      onClick={(_, index) => setActiveCategoryIndex(activeCategoryIndex === index ? null : index)}
                    >
                      {displayCategories.map((entry, index) => {
                        const isSelected = activeCategoryIndex === index
                        const isAnySelected = activeCategoryIndex !== null
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                            opacity={!isAnySelected || isSelected ? 1 : 0.35}
                            className="cursor-pointer transition-opacity duration-200"
                          />
                        )
                      })}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Centered Animated HUD */}
                <div className="absolute inset-0 flex items-center justify-center text-center pointer-events-none">
                  <AnimatePresence mode="wait">
                    {activeCategoryIndex !== null && displayCategories[activeCategoryIndex] ? (
                      <motion.div
                        key={`active-${displayCategories[activeCategoryIndex].name}`}
                        initial={{ scale: 0.75, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.75, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-col items-center justify-center text-center px-1"
                      >
                        <span 
                          className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[85px]"
                          style={{ color: displayCategories[activeCategoryIndex].color }}
                        >
                          {displayCategories[activeCategoryIndex].name}
                        </span>
                        <span className="text-[14px] font-bold text-text-primary font-mono leading-tight mt-0.5">
                          {currencySymbol}{formatNumber(Math.round(displayCategories[activeCategoryIndex].value), currencySymbol, 0, 0)}
                        </span>
                        <span 
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5"
                          style={{ 
                            backgroundColor: `${displayCategories[activeCategoryIndex].color}25`,
                            color: displayCategories[activeCategoryIndex].color 
                          }}
                        >
                          {displayCategories[activeCategoryIndex].pct}
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="default-center"
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.85, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-col items-center justify-center text-center"
                      >
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-text-secondary">
                          TOTAL SPENT
                        </span>
                        <span className="text-[15px] font-bold text-text-primary font-mono leading-tight mt-0.5">
                          {currencySymbol}{formatNumber(Math.round(totalCatExpense), currencySymbol, 0, 0)}
                        </span>
                        <span className="text-[10px] text-text-secondary mt-0.5">
                          {displayCategories.length} categories
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Category Breakdown Table */}
              <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1 [scrollbar-width:none]">
                {displayCategories.map((cat, idx) => {
                  const isHovered = activeCategoryIndex === idx

                  return (
                    <div
                      key={cat.name}
                      onClick={() => setActiveCategoryIndex(activeCategoryIndex === idx ? null : idx)}
                      onMouseEnter={() => setActiveCategoryIndex(idx)}
                      onMouseLeave={() => setActiveCategoryIndex(null)}
                      className={`flex items-center justify-between p-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
                        isHovered ? 'bg-surface-2 shadow-elevation-sm scale-[1.01]' : 'hover:bg-surface-2/40 text-text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className={`font-medium truncate ${isHovered ? 'text-text-primary font-semibold' : 'text-text-primary'}`}>{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono shrink-0">
                        <span className="text-text-secondary text-[11px]">{cat.pct}</span>
                        <span className="font-semibold text-text-primary">
                          {currencySymbol}{formatNumber(Math.round(cat.value), currencySymbol, 0, 0)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-text-muted text-xs">
              No category data available yet.
            </div>
          )}
        </div>
      </div>

      {/* Financial Health Section */}
      <FinancialHealthCard
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        budgetLimit={budgetLimit * multiplier}
        expenses={displayExpenses}
        currencySymbol={currencySymbol}
      />
    </div>
  )
}
