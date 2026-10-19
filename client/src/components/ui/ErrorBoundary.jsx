import React from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  handleReset = () => {
    try {
      localStorage.clear()
    } catch { /* localStorage.clear may fail in restricted environments */ }
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-card bg-surface-2 border border-border-default shadow-elevation-modal text-center space-y-4">
            <div className="w-10 h-10 rounded-control bg-negative/10 border border-negative/20 text-negative flex items-center justify-center mx-auto">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Something went wrong</h2>
            <p className="text-xs text-text-secondary">
              {this.state.error?.message || "An unexpected error occurred while rendering the dashboard."}
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-control bg-brand hover:bg-brand-hover active:bg-brand-active text-white text-xs font-medium transition-colors shadow-elevation-sm cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Cache & Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
