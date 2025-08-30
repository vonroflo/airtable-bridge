import React from 'react'

interface StatusBadgeProps {
  status: 'healthy' | 'warning' | 'error' | 'active' | 'inactive' | 'pending' | 'running' | 'completed' | 'failed'
  pulse?: boolean
}

export default function StatusBadge({ status, pulse = false }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
      case 'completed':
        return {
          className: 'status-healthy',
          text: status.charAt(0).toUpperCase() + status.slice(1)
        }
      case 'warning':
      case 'pending':
        return {
          className: 'status-warning',
          text: status.charAt(0).toUpperCase() + status.slice(1)
        }
      case 'error':
      case 'failed':
      case 'inactive':
        return {
          className: 'status-error',
          text: status.charAt(0).toUpperCase() + status.slice(1)
        }
      case 'running':
        return {
          className: 'status-warning',
          text: 'Running'
        }
      default:
        return {
          className: 'status-indicator bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
          text: status.charAt(0).toUpperCase() + status.slice(1)
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span className={`${config.className} ${pulse ? 'animate-pulse-slow' : ''}`}>
      {pulse && (
        <span className="w-2 h-2 bg-current rounded-full mr-1.5 animate-pulse"></span>
      )}
      {config.text}
    </span>
  )
}