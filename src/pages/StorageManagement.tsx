import React from 'react'
import { HardDrive, Archive, Download, Upload, Trash2 } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import MetricCard from '../components/ui/MetricCard'
import StatusBadge from '../components/ui/StatusBadge'

// Mock data for demonstration
const mockStorageMetrics = {
  totalUsed: 2.4, // GB
  totalCapacity: 10, // GB
  archivedRecords: 45000,
  s3Storage: 1.8, // GB
  attachmentCount: 2340
}

const mockStorageByBase = [
  { name: 'CRM Base', storage: 0.8, color: '#3b82f6' },
  { name: 'Inventory', storage: 0.6, color: '#10b981' },
  { name: 'Projects', storage: 0.5, color: '#f59e0b' },
  { name: 'HR Data', storage: 0.3, color: '#ef4444' },
  { name: 'Other', storage: 0.2, color: '#6b7280' },
]

const mockArchivalHistory = [
  { date: '2025-01', archived: 1200, restored: 45 },
  { date: '2024-12', archived: 980, restored: 23 },
  { date: '2024-11', archived: 1450, restored: 67 },
  { date: '2024-10', archived: 890, restored: 12 },
  { date: '2024-09', archived: 1100, restored: 34 },
  { date: '2024-08', archived: 750, restored: 18 },
]

const mockArchivedBases = [
  { baseId: 'appXXXXXXXXXXXXXX', baseName: 'CRM Base', archivedRecords: 12000, storageFreed: '450MB', lastArchival: '2025-01-25T10:30:00Z' },
  { baseId: 'appYYYYYYYYYYYYYY', baseName: 'Inventory', archivedRecords: 8500, storageFreed: '320MB', lastArchival: '2025-01-24T15:20:00Z' },
  { baseId: 'appZZZZZZZZZZZZZZ', baseName: 'Projects', archivedRecords: 15000, storageFreed: '680MB', lastArchival: '2025-01-23T09:15:00Z' },
]

export default function StorageManagement() {
  const storageUsagePercent = (mockStorageMetrics.totalUsed / mockStorageMetrics.totalCapacity) * 100

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Storage Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor storage usage and manage data archival
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
            <Archive className="w-4 h-4" />
            <span>Archive Old Records</span>
          </button>
        </div>
      </div>

      {/* Storage Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Storage Used"
          value={`${mockStorageMetrics.totalUsed}GB`}
          icon={HardDrive}
          status={storageUsagePercent > 80 ? 'error' : storageUsagePercent > 60 ? 'warning' : 'healthy'}
          change={{ value: 12, type: 'increase', period: 'last week' }}
        />
        
        <MetricCard
          title="Archived Records"
          value={mockStorageMetrics.archivedRecords.toLocaleString()}
          icon={Archive}
          status="healthy"
          change={{ value: 8, type: 'increase', period: 'last month' }}
        />
        
        <MetricCard
          title="S3 Storage"
          value={`${mockStorageMetrics.s3Storage}GB`}
          icon={Upload}
          status="healthy"
          change={{ value: 15, type: 'increase', period: 'last week' }}
        />
        
        <MetricCard
          title="Attachments"
          value={mockStorageMetrics.attachmentCount.toLocaleString()}
          icon={Download}
          status="healthy"
          change={{ value: 5, type: 'increase', period: 'last week' }}
        />
      </div>

      {/* Storage Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Storage Capacity Overview
        </h3>
        <div className="flex items-center space-x-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Usage</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {mockStorageMetrics.totalUsed}GB / {mockStorageMetrics.totalCapacity}GB
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  storageUsagePercent > 80 ? 'bg-red-500' : 
                  storageUsagePercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${storageUsagePercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {storageUsagePercent.toFixed(1)}% of capacity used
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage by Base */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Storage by Base
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockStorageByBase}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="storage"
              >
                {mockStorageByBase.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}GB`, 'Storage']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {mockStorageByBase.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.storage}GB
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Archival History */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Archival Activity
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockArchivalHistory}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="archived" fill="#6366f1" name="Archived" />
              <Bar dataKey="restored" fill="#10b981" name="Restored" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Archived Bases Summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Archival Summary by Base
          </h3>
          <button className="flex items-center space-x-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Base</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Archived Records</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Storage Freed</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Last Archival</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockArchivedBases.map((base) => (
                <tr key={base.baseId} className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {base.baseName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {base.baseId}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {base.archivedRecords.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {base.storageFreed}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(base.lastArchival).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Download Archive">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors" title="Restore Records">
                        <Upload className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete Archive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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