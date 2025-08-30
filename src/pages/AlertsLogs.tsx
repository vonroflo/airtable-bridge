import React, { useState } from 'react'
import { AlertTriangle, CheckCircle, Info, XCircle, Search, Filter } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'

// Mock data for demonstration
const mockAlerts = [
  { id: 'alert_001', type: 'error', title: 'Queue depth exceeded threshold', message: 'Queue depth reached 85 jobs, exceeding the 50 job threshold', baseId: 'appXXXXXXXXXXXXXX', timestamp: '2025-01-27T10:35:00Z', resolved: false },
  { id: 'alert_002', type: 'warning', title: 'High response time detected', message: 'Average response time increased to 450ms', baseId: 'appYYYYYYYYYYYYYY', timestamp: '2025-01-27T10:20:00Z', resolved: true },
  { id: 'alert_003', type: 'info', title: 'Sync completed successfully', message: 'Full sync completed for CRM Base with 1,920 records processed', baseId: 'appXXXXXXXXXXXXXX', timestamp: '2025-01-27T10:15:00Z', resolved: true },
  { id: 'alert_004', type: 'error', title: 'API authentication failed', message: 'Invalid API key for base: Inventory', baseId: 'appZZZZZZZZZZZZZZ', timestamp: '2025-01-27T10:10:00Z', resolved: false },
]

const mockLogs = [
  { id: 'log_001', level: 'info', message: 'Base registered successfully', baseId: 'appXXXXXXXXXXXXXX', timestamp: '2025-01-27T10:40:00Z', details: { baseName: 'CRM Base', rateLimitRpm: 300 } },
  { id: 'log_002', level: 'error', message: 'Batch operation failed', baseId: 'appYYYYYYYYYYYYYY', timestamp: '2025-01-27T10:38:00Z', details: { operation: 'batch_create', recordCount: 10, error: 'Rate limit exceeded' } },
  { id: 'log_003', level: 'warn', message: 'Queue depth approaching limit', baseId: 'appXXXXXXXXXXXXXX', timestamp: '2025-01-27T10:35:00Z', details: { queueDepth: 45, threshold: 50 } },
  { id: 'log_004', level: 'info', message: 'Sync job completed', baseId: 'appZZZZZZZZZZZZZZ', timestamp: '2025-01-27T10:30:00Z', details: { syncType: 'incremental', recordsProcessed: 150, duration: '2m 15s' } },
]

export default function AlertsLogs() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'logs'>('alerts')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')

  const filteredAlerts = mockAlerts.filter(alert =>
    alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = !selectedLevel || log.level === selectedLevel
    return matchesSearch && matchesLevel
  })

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info': return <Info className="w-5 h-5 text-blue-500" />
      default: return <CheckCircle className="w-5 h-5 text-green-500" />
    }
  }

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'info': return <Info className="w-4 h-4 text-blue-500" />
      default: return <CheckCircle className="w-4 h-4 text-green-500" />
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Alerts & Logs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor system alerts and review activity logs
          </p>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {mockAlerts.filter(a => a.type === 'error' && !a.resolved).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Warnings</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {mockAlerts.filter(a => a.type === 'warning' && !a.resolved).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Info</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {mockAlerts.filter(a => a.type === 'info').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {mockAlerts.filter(a => a.resolved).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'alerts'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Alerts ({mockAlerts.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Logs ({mockLogs.length})
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
            {activeTab === 'logs' && (
              <select 
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Levels</option>
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
              </select>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'alerts' ? (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${
                  alert.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50' :
                  alert.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50' :
                  'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50'
                }`}>
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {alert.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={alert.resolved ? 'completed' : 'pending'} />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-mono">
                        Base: {alert.baseId}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                  <div className="flex items-start space-x-3">
                    {getLogIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {log.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {log.baseId}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          log.level === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          log.level === 'warn' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {log.level.toUpperCase()}
                        </span>
                      </div>
                      {log.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                            Show details
                          </summary>
                          <pre className="text-xs text-gray-600 dark:text-gray-400 mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}