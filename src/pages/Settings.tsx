import React, { useState } from 'react'
import { Save, RefreshCw, AlertTriangle, Database, Clock, Shield } from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState({
    globalRateLimit: 1000,
    defaultBaseRateLimit: 300,
    queueConcurrency: 5,
    queueRetryDelay: 5000,
    queueMaxAttempts: 3,
    cacheTtl: 300000,
    queryCacheTtl: 600000,
    syncBatchSize: 100,
    syncPollingInterval: 30000,
    webhookTimeout: 10000,
    alertThresholds: {
      queueDepth: 50,
      responseTime: 1000,
      errorRate: 5,
      storageUsage: 80
    }
  })

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving settings:', settings)
  }

  const handleReset = () => {
    // Reset to defaults
    setSettings({
      globalRateLimit: 1000,
      defaultBaseRateLimit: 300,
      queueConcurrency: 5,
      queueRetryDelay: 5000,
      queueMaxAttempts: 3,
      cacheTtl: 300000,
      queryCacheTtl: 600000,
      syncBatchSize: 100,
      syncPollingInterval: 30000,
      webhookTimeout: 10000,
      alertThresholds: {
        queueDepth: 50,
        responseTime: 1000,
        errorRate: 5,
        storageUsage: 80
      }
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure system parameters and alert thresholds
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Rate Limiting Settings */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <Shield className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Rate Limiting
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Global Rate Limit (requests/minute)
            </label>
            <input
              type="number"
              value={settings.globalRateLimit}
              onChange={(e) => setSettings(prev => ({ ...prev, globalRateLimit: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Base Rate Limit (requests/minute)
            </label>
            <input
              type="number"
              value={settings.defaultBaseRateLimit}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultBaseRateLimit: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Queue Configuration */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <Clock className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Queue Configuration
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Concurrency
            </label>
            <input
              type="number"
              value={settings.queueConcurrency}
              onChange={(e) => setSettings(prev => ({ ...prev, queueConcurrency: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Retry Delay (ms)
            </label>
            <input
              type="number"
              value={settings.queueRetryDelay}
              onChange={(e) => setSettings(prev => ({ ...prev, queueRetryDelay: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Attempts
            </label>
            <input
              type="number"
              value={settings.queueMaxAttempts}
              onChange={(e) => setSettings(prev => ({ ...prev, queueMaxAttempts: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Cache Configuration */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <Database className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cache Configuration
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Cache TTL (ms)
            </label>
            <input
              type="number"
              value={settings.cacheTtl}
              onChange={(e) => setSettings(prev => ({ ...prev, cacheTtl: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {(settings.cacheTtl / 1000 / 60).toFixed(1)} minutes
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Query Cache TTL (ms)
            </label>
            <input
              type="number"
              value={settings.queryCacheTtl}
              onChange={(e) => setSettings(prev => ({ ...prev, queryCacheTtl: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {(settings.queryCacheTtl / 1000 / 60).toFixed(1)} minutes
            </p>
          </div>
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Alert Thresholds
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Queue Depth
            </label>
            <input
              type="number"
              value={settings.alertThresholds.queueDepth}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                alertThresholds: { 
                  ...prev.alertThresholds, 
                  queueDepth: parseInt(e.target.value) 
                }
              }))}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Response Time (ms)
            </label>
            <input
              type="number"
              value={settings.alertThresholds.responseTime}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                alertThresholds: { 
                  ...prev.alertThresholds, 
                  responseTime: parseInt(e.target.value) 
                }
              }))}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Error Rate (%)
            </label>
            <input
              type="number"
              value={settings.alertThresholds.errorRate}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                alertThresholds: { 
                  ...prev.alertThresholds, 
                  errorRate: parseInt(e.target.value) 
                }
              }))}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Storage Usage (%)
            </label>
            <input
              type="number"
              value={settings.alertThresholds.storageUsage}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                alertThresholds: { 
                  ...prev.alertThresholds, 
                  storageUsage: parseInt(e.target.value) 
                }
              }))}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          System Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Version</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">v1.0.0</p>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Environment</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Development</p>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Uptime</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">2d 14h 32m</p>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Database</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">PostgreSQL 14.2</p>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Cache</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Redis 7.0</p>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Queue</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">BullMQ 4.0</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200 dark:border-red-800">
        <div className="flex items-center space-x-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
            Danger Zone
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Clear All Caches
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remove all cached data. This will temporarily impact performance.
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
              Clear Caches
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Reset All Queues
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Clear all pending jobs. This will cancel in-progress operations.
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
              Reset Queues
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}