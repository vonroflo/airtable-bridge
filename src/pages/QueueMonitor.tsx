import React from 'react'
import { Clock, Play, Pause, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import MetricCard from '../components/ui/MetricCard'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'

// Mock data for demonstration
const mockQueueMetrics = {
  depth: 42,
  processing: 8,
  completed: 1247,
  failed: 12,
  avgProcessingTime: 2.3,
  throughputPerHour: 3600,
  oldestJobAge: 5,
  retryQueue: 3
}

const mockThroughputData = [
  { time: '00:00', completed: 45, failed: 2 },
  { time: '04:00', completed: 32, failed: 1 },
  { time: '08:00', completed: 78, failed: 3 },
  { time: '12:00', completed: 95, failed: 5 },
  { time: '16:00', completed: 87, failed: 2 },
  { time: '20:00', completed: 65, failed: 1 },
]

const mockJobTypes = [
  { type: 'batch_create', count: 25, avgTime: 1.8 },
  { type: 'batch_update', count: 15, avgTime: 2.1 },
  { type: 'batch_delete', count: 8, avgTime: 1.2 },
  { type: 'sync_operation', count: 12, avgTime: 4.5 },
  { type: 'webhook_processing', count: 35, avgTime: 0.8 },
]

const mockActiveJobs = [
  { id: 'job_001', type: 'batch_create', baseId: 'appXXXXXXXXXXXXXX', progress: 75, startedAt: '2025-01-27T10:30:00Z' },
  { id: 'job_002', type: 'sync_operation', baseId: 'appYYYYYYYYYYYYYY', progress: 45, startedAt: '2025-01-27T10:28:00Z' },
  { id: 'job_003', type: 'batch_update', baseId: 'appZZZZZZZZZZZZZZ', progress: 90, startedAt: '2025-01-27T10:32:00Z' },
]

const mockFailedJobs = [
  { id: 'job_failed_001', type: 'batch_create', baseId: 'appXXXXXXXXXXXXXX', error: 'Rate limit exceeded', failedAt: '2025-01-27T10:25:00Z', attempts: 3 },
  { id: 'job_failed_002', type: 'webhook_processing', baseId: 'appYYYYYYYYYYYYYY', error: 'Invalid payload', failedAt: '2025-01-27T10:20:00Z', attempts: 1 },
]

export default function QueueMonitor() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Queue Monitor
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time job queue monitoring and management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <Play className="w-4 h-4" />
            <span>Resume All</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
            <Pause className="w-4 h-4" />
            <span>Pause All</span>
          </button>
        </div>
      </div>

      {/* Queue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Queue Depth"
          value={mockQueueMetrics.depth}
          icon={Clock}
          status={mockQueueMetrics.depth > 50 ? 'warning' : 'healthy'}
          change={{ value: 12, type: 'increase', period: 'last hour' }}
        />
        
        <MetricCard
          title="Processing"
          value={mockQueueMetrics.processing}
          icon={Play}
          status="healthy"
        />
        
        <MetricCard
          title="Completed Today"
          value={mockQueueMetrics.completed}
          icon={CheckCircle}
          status="healthy"
          change={{ value: 8, type: 'increase', period: 'yesterday' }}
        />
        
        <MetricCard
          title="Failed Jobs"
          value={mockQueueMetrics.failed}
          icon={AlertTriangle}
          status={mockQueueMetrics.failed > 20 ? 'error' : 'healthy'}
          change={{ value: 2, type: 'decrease', period: 'last hour' }}
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Avg Processing Time"
          value={`${mockQueueMetrics.avgProcessingTime}s`}
          icon={Clock}
          status="healthy"
          change={{ value: 5, type: 'decrease', period: 'last hour' }}
        />
        
        <MetricCard
          title="Throughput/Hour"
          value={mockQueueMetrics.throughputPerHour}
          icon={RotateCcw}
          status="healthy"
          change={{ value: 15, type: 'increase', period: 'last hour' }}
        />
        
        <MetricCard
          title="Oldest Job"
          value={`${mockQueueMetrics.oldestJobAge}m`}
          icon={Clock}
          status={mockQueueMetrics.oldestJobAge > 10 ? 'warning' : 'healthy'}
        />
        
        <MetricCard
          title="Retry Queue"
          value={mockQueueMetrics.retryQueue}
          icon={RotateCcw}
          status="healthy"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Throughput Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Job Throughput
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockThroughputData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Completed"
              />
              <Line 
                type="monotone" 
                dataKey="failed" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Failed"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Job Types Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Job Types Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockJobTypes}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="type" className="text-xs" angle={-45} textAnchor="end" height={80} />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Jobs */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Active Jobs
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {mockActiveJobs.length} jobs processing
          </span>
        </div>
        
        <div className="space-y-4">
          {mockActiveJobs.map((job) => (
            <div key={job.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <StatusBadge status="running" pulse />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {job.type.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {job.id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {job.progress}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Started {new Date(job.startedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Failed Jobs */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Failed Jobs
          </h3>
          <button className="flex items-center space-x-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors">
            <RotateCcw className="w-4 h-4" />
            <span>Retry All</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {mockFailedJobs.map((job) => (
            <div key={job.id} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <StatusBadge status="failed" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {job.type.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {job.id}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {job.error}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Attempts: {job.attempts}/3
                  </span>
                  <button className="p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-colors">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}