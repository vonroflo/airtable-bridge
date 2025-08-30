import React, { useState } from 'react'
import { Play, Clock, CheckCircle, AlertTriangle, Users, Building } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '../utils/api'
import MetricCard from '../components/ui/MetricCard'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'

interface ProvisioningRequest {
  customerId: string
  customerName: string
  customerEmail: string
  portalName: string
  deploymentModel: 'isolated' | 'shared'
  includeSampleData: boolean
  userList?: Array<{
    name: string
    email: string
    role: 'admin' | 'team' | 'client'
  }>
}

interface ProvisioningJob {
  id: string
  customerId: string
  status: 'pending' | 'creating_base' | 'deploying_schema' | 'creating_portal' | 'configuring_users' | 'completed' | 'failed'
  progress: number
  airtableBaseId?: string
  softrPortalId?: string
  error?: string
  startedAt: string
  completedAt?: string
  estimatedCompletion?: string
}

export default function Provisioning() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<ProvisioningRequest>({
    customerId: '',
    customerName: '',
    customerEmail: '',
    portalName: '',
    deploymentModel: 'isolated',
    includeSampleData: true,
    userList: []
  })

  // Get CRM schema info
  const { data: schemaData } = useQuery({
    queryKey: ['crm-schema'],
    queryFn: () => apiClient.get('/provisioning/schema')
  })

  // Start provisioning mutation
  const startProvisioningMutation = useMutation({
    mutationFn: (data: ProvisioningRequest) => apiClient.post('/provisioning/start', data),
    onSuccess: (response) => {
      console.log('Provisioning started:', response)
      setShowForm(false)
      // Reset form
      setFormData({
        customerId: '',
        customerName: '',
        customerEmail: '',
        portalName: '',
        deploymentModel: 'isolated',
        includeSampleData: true,
        userList: []
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startProvisioningMutation.mutate(formData)
  }

  const addUser = () => {
    setFormData(prev => ({
      ...prev,
      userList: [
        ...(prev.userList || []),
        { name: '', email: '', role: 'team' }
      ]
    }))
  }

  const removeUser = (index: number) => {
    setFormData(prev => ({
      ...prev,
      userList: prev.userList?.filter((_, i) => i !== index) || []
    }))
  }

  const updateUser = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      userList: prev.userList?.map((user, i) => 
        i === index ? { ...user, [field]: value } : user
      ) || []
    }))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            CRM Portal Provisioning
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Automated Airtable + Softr CRM portal deployment
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>Start Provisioning</span>
        </button>
      </div>

      {/* CRM Schema Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          CRM Schema Overview
        </h3>
        {schemaData ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              title="Tables"
              value={schemaData.schema.tables.length}
              icon={Building}
              status="healthy"
            />
            <MetricCard
              title="Total Fields"
              value={schemaData.schema.tables.reduce((sum: number, table: any) => sum + table.fieldCount, 0)}
              icon={Users}
              status="healthy"
            />
            <MetricCard
              title="Views"
              value={schemaData.schema.tables.reduce((sum: number, table: any) => sum + table.viewCount, 0)}
              icon={CheckCircle}
              status="healthy"
            />
            <MetricCard
              title="Relationships"
              value={schemaData.schema.relationshipCount}
              icon={AlertTriangle}
              status="healthy"
            />
          </div>
        ) : (
          <LoadingSpinner />
        )}
      </div>

      {/* Schema Tables */}
      {schemaData && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            CRM Tables
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schemaData.schema.tables.map((table: any, index: number) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {table.name}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {table.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{table.fieldCount} fields</span>
                  <span>{table.viewCount} views</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provisioning Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Start CRM Portal Provisioning
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Customer ID
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerId}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Portal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.portalName}
                    onChange={(e) => setFormData(prev => ({ ...prev, portalName: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Configuration Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deployment Model
                  </label>
                  <select
                    value={formData.deploymentModel}
                    onChange={(e) => setFormData(prev => ({ ...prev, deploymentModel: e.target.value as 'isolated' | 'shared' }))}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="isolated">Isolated (Dedicated Base)</option>
                    <option value="shared">Shared (Multi-tenant Base)</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sampleData"
                    checked={formData.includeSampleData}
                    onChange={(e) => setFormData(prev => ({ ...prev, includeSampleData: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="sampleData" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Include Sample Data
                  </label>
                </div>
              </div>

              {/* User List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Initial Users
                  </label>
                  <button
                    type="button"
                    onClick={addUser}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add User
                  </button>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {formData.userList?.map((user, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Name"
                        value={user.name}
                        onChange={(e) => updateUser(index, 'name', e.target.value)}
                        className="col-span-4 px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={user.email}
                        onChange={(e) => updateUser(index, 'email', e.target.value)}
                        className="col-span-4 px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <select
                        value={user.role}
                        onChange={(e) => updateUser(index, 'role', e.target.value)}
                        className="col-span-3 px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="admin">Admin</option>
                        <option value="team">Team</option>
                        <option value="client">Client</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeUser(index)}
                        className="col-span-1 text-red-600 hover:text-red-700 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={startProvisioningMutation.isPending}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {startProvisioningMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>Start Provisioning</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recent Provisioning Jobs */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Recent Provisioning Jobs
        </h3>
        
        <div className="space-y-4">
          {/* Mock recent jobs */}
          {[
            { id: 'job_001', customerName: 'Acme Corp', status: 'completed', progress: 100, startedAt: '2025-01-27T10:30:00Z' },
            { id: 'job_002', customerName: 'TechStart Inc', status: 'creating_portal', progress: 75, startedAt: '2025-01-27T10:25:00Z' },
            { id: 'job_003', customerName: 'Global Solutions', status: 'failed', progress: 45, startedAt: '2025-01-27T10:20:00Z' },
          ].map((job) => (
            <div key={job.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <StatusBadge status={job.status as any} pulse={job.status === 'creating_portal'} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {job.customerName}
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
              {job.status !== 'completed' && job.status !== 'failed' && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}