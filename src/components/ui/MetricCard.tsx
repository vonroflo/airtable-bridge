import React from 'react'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  icon: LucideIcon
  status?: 'healthy' | 'warning' | 'error'
  onClick?: () => void
}

export default function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  status = 'healthy',
  onClick 
}: MetricCardProps) {
  const statusColors = {
    healthy: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400'
  }

  const changeColors = {
    increase: 'text-green-600 dark:text-green-400',
    decrease: 'text-red-600 dark:text-red-400'
  }

  return (
    <div 
      className={`metric-card ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <p className={`text-xs ${changeColors[change.type]}`}>
              {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}% 
              <span className="text-gray-500 ml-1">vs {change.period}</span>
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-800 ${statusColors[status]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}