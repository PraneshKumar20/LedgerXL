import { useEffect, useState } from "react"
import { formatNumber } from "../../utils/formatUtils"

export default function AnimatedCounter({ 
  value, 
  duration = 800, 
  decimals = 2, 
  prefix = "", 
  suffix = "",
  className = ""
}) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    let startTime = null
    const startVal = displayValue
    const endVal = Number(value) || 0

    if (startVal === endVal) return

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3)
      const current = startVal + (endVal - startVal) * ease

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        setDisplayValue(endVal)
      }
    }

    const frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  return (
    <span className={className}>
      {prefix}
      {formatNumber(displayValue, prefix, decimals, decimals)}
      {suffix}
    </span>
  )
}
