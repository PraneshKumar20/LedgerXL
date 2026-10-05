import { createContext, useContext, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ title, message, type = "success", duration = 3500 }) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => {
      // Prevent duplicate toasts with the exact same title and message
      const hasDuplicate = prev.some(t => t.title === title && t.message === message)
      if (hasDuplicate) return prev
      // Cap at 3 visible notifications so screen is never flooded
      const trimmed = prev.length >= 3 ? prev.slice(prev.length - 2) : prev
      return [...trimmed, { id, title, message, type }]
    })

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-20 lg:bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`pointer-events-auto p-3.5 rounded-card border shadow-elevation-lg flex items-start gap-3 bg-surface-2 ${
                toast.type === "error"
                  ? "border-negative/30 text-text-primary"
                  : toast.type === "info"
                  ? "border-info/30 text-text-primary"
                  : "border-positive/30 text-text-primary"
              }`}
            >
              {toast.type === "error" ? (
                <AlertCircle className="h-5 w-5 text-negative shrink-0 mt-0.5" />
              ) : toast.type === "info" ? (
                <Info className="h-5 w-5 text-info shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-positive shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                {toast.title && <p className="text-xs font-bold text-text-primary mb-0.5">{toast.title}</p>}
                {toast.message && <p className="text-xs text-text-secondary leading-relaxed">{toast.message}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-text-muted hover:text-text-primary transition-colors p-1 -mr-1 -mt-1"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    return {
      addToast: () => {},
      removeToast: () => {}
    }
  }
  return context
}
