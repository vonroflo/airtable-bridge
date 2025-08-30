import React, { useState } from 'react'
import { Plus, Search, MoreVertical, Edit, Trash2, Play, Pause } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useBases, useUpdateBase, useDeleteBase } from '../hooks/useBases'
import { AirtableBase } from '../types'

export default function BasesManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedBase, setSelectedBase] = useState<AirtableBase | null>(null)
  
  const { data: basesData, isLoading } = useBases()
  const updateBaseMutation = useUpdateBase()
  const deleteBaseMutation = useDeleteBase()

  const filteredBases = basesData?.bases?.filter(base =>
    base.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    base.baseId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleToggleActive = async (base: AirtableBase) => {
    try {
      await updateBaseMutation.mutateAsync({
        baseId: base.baseId,
        isActive: !base.isActive
      })
    } catch (error) {
      console.error('Failed to toggle base status:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bases Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure and monitor your Airtable bases
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Base</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bases Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Base</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Tables</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Rate Limit</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">API Calls Today</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBases.map((base) => (
                <tr key={base.id} className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {base.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {base.baseId}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={base.isActive ? 'active' : 'inactive'} />
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {base._count?.tables || 0}
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {base.rateLimitRpm}/min
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.floor(base.rateLimitRpm / 60)}/sec
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {Math.floor(Math.random() * 1000)}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-primary-500 h-1.5 rounded-full" 
                        style={{ width: `${Math.random() * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(base.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(base)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          base.isActive 
                            ? 'text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30' 
                            : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30'
                        }`}
                        title={base.isActive ? 'Pause' : 'Activate'}
                      >
                        {base.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setSelectedBase(base)}
                        className="p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${base.name}?`)) {
                            deleteBaseMutation.mutate(base.baseId)
                          }
                        }}
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBases.length === 0 && (
          <div className="text-center py-12">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No bases found matching your search.' : 'No bases configured yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {basesData?.pagination && basesData.pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((basesData.pagination.page - 1) * basesData.pagination.limit) + 1} to{' '}
            {Math.min(basesData.pagination.page * basesData.pagination.limit, basesData.pagination.total)} of{' '}
            {basesData.pagination.total} results
          </p>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}