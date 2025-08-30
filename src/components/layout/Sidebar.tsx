import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Database, 
  Clock, 
  RefreshCw, 
  BarChart3, 
  HardDrive, 
  AlertTriangle, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Bases', href: '/bases', icon: Database },
  { name: 'Queue Monitor', href: '/queue', icon: Clock },
  { name: 'Sync Status', href: '/sync', icon: RefreshCw },
  { name: 'API Metrics', href: '/metrics', icon: BarChart3 },
  { name: 'Storage', href: '/storage', icon: HardDrive },
  { name: 'Alerts & Logs', href: '/alerts', icon: AlertTriangle },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out`}>
      <div className="h-full glass border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">Bridge</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Platform Monitor</p>
                </div>
              </div>
            )}
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="ml-3 text-sm font-medium">{item.name}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
          {!collapsed && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>Airtable Bridge v1.0.0</p>
              <p>© 2025 Bridge Platform</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}