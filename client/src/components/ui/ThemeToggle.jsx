import { Sun, Moon } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "../../context/ThemeContext"

export default function ThemeToggle({ 
  showLabel = false, 
  className = "", 
  variant = "ghost" 
}) {
  const { theme, isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus ${
        variant === "outline"
          ? "border border-border-default bg-surface-1 hover:bg-surface-hover text-text-primary px-3 py-1.5 text-xs font-medium shadow-elevation-sm"
          : "p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover"
      } ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <motion.div
        key={theme}
        initial={{ scale: 0.7, rotate: isDark ? -45 : 45, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0.7, rotate: isDark ? 45 : -45, opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="flex items-center gap-2"
      >
        {isDark ? (
          <Sun className="h-4 w-4 text-amber-400 shrink-0" />
        ) : (
          <Moon className="h-4 w-4 text-brand shrink-0" />
        )}
        {showLabel && (
          <span className="text-xs font-medium font-sans">
            {isDark ? "Light Mode" : "Dark Mode"}
          </span>
        )}
      </motion.div>
    </button>
  )
}
