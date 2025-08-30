import React from 'react'
import { RefreshCw, Play, Pause, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import MetricCard from '../components/ui/MetricCard'
import StatusBadge from '../components/ui/StatusBadge'

// Mock data for demonstration
const mockSyncMetrics = {
  activeSyncs: 3,
  completedToday: 24,
  averageSyncTime: 45,
  conflictsDetected: 2,
  syncLag: 32,
  successRate: 98.5
}

const mockSyncLagData = [
  { time: '00:00', lag: 25 },
  { time: '04:00', lag: 18 },
  { time: '08:00', lag: 35 },
  { time: '12:00', lag: 42 },
  { time: '16:00', lag: 28 },
  { time: '20:00', lag: 22 },
]

const mockActiveSyncs = [
  { 
    id: 'sync_001', 
    baseId: 'appXXXXXXXXXXXXXX', 
    baseName: 'CRM Base',
    type: 'incremental', 
    progress: 65, 
    recordsProcessed: 1250,
    recordsTotal: 1920,
    startedAt: '2025-01-27T10:25:00Z',
    estimatedCompletion: '2025-01-27T10:45:00Z'
  },
  { 
    id: 'sync_002', 
    baseId: 'appYYYYYYYYYYYYYY', 
    baseName: 'Inventory',
    type: 'full', 
    progress: 25, 
    recordsProcessed: 500,
    recordsTotal: 2000,
    startedAt: '2025-01-27T10:30:00Z',
    estimatedCompletion: '2025-01-27T11:00:00Z'
  },
]

const mockSyncHistory = [
  { id: 'sync_h_001', baseName: 'CRM Base', type: 'incremental', status: 'completed', duration: '2m 15s', recordsProcessed: 1920, completedAt: '2025-01-27T10:20:00Z' },
  { id: 'sync_h_002', baseName: 'Projects', type: 'full', status: 'completed', duration: '5m 42s', recordsProcessed: 3500, completedAt: '2025-01-27T10:15:00Z' },
  { id: 'sync_h_003', baseName: 'HR Data', type: 'webhook-triggered', status: 'failed', duration: '0m 30s', recordsProcessed: 0, completedAt: '2025-01-27T10:10:00Z' },
]

export default function SyncStatus() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sync Status
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor bi-directional synchronization operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>Trigger Full Sync</span>
          </button>
        </div>
      </div>

      {/* Sync Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Active Syncs"
          value={mockSyncMetrics.activeSyncs}
          icon={RefreshCw}
          status="healthy"
        />
        
        <MetricCard
          title="Avg Sync Time"
          value={`${mockSyncMetrics.averageSyncTime}s`}
          icon={Clock}
          status="healthy"
          change={{ value: 8, type: 'decrease', period: 'last week' }}
        />
        
        <MetricCard
          title="Success Rate"
          value={`${mockSyncMetrics.successRate}%`}
          icon={CheckCircle}
          status="healthy"
          change={{ value: 0.5, type: 'increase', period: 'last week' }}
        />
      </div>

      {/* Sync Lag Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Sync Lag Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockSyncLagData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="time" className="text-xs" />
            <YAxis className="text-xs" label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="lag" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Active Sync Operations */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Active Sync Operations
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {mockActiveSyncs.length} operations running
          </span>
        </div>
        
        <div className="space-y-4">
          {mockActiveSyncs.map((sync) => (
            <div key={sync.id} className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <StatusBadge status="running" pulse />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {sync.baseName} - {sync.type.toUpperCase()} SYNC
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {sync.id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {sync.recordsProcessed.toLocaleString()} / {sync.recordsTotal.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ETA: {new Date(sync.estimatedCompletion).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${sync.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>{sync.progress}% complete</span>
                <span>Started {new Date(sync.startedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Recent Sync History
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Base</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Duration</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Records</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Completed</th>
              </tr>
            </thead>
            <tbody>
              {mockSyncHistory.map((sync) => (
                <tr key={sync.id} className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    {sync.baseName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                      {sync.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={sync.status as any} />
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {sync.duration}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {sync.recordsProcessed.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(sync.completedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}