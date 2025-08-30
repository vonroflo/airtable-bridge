import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Overview from './pages/Overview'
import BasesManagement from './pages/BasesManagement'
import QueueMonitor from './pages/QueueMonitor'
import SyncStatus from './pages/SyncStatus'
import ApiMetrics from './pages/ApiMetrics'
import StorageManagement from './pages/StorageManagement'
import AlertsLogs from './pages/AlertsLogs'
import Settings from './pages/Settings'
import Provisioning from './pages/Provisioning'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex bg-gray-50 dark:bg-gray-950">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        <div className="flex-1 flex flex-col min-h-screen">
          <Header 
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
          />
          
          <main className="flex-1 p-6 overflow-auto custom-scrollbar">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/bases" element={<BasesManagement />} />
              <Route path="/queue" element={<QueueMonitor />} />
              <Route path="/sync" element={<SyncStatus />} />
              <Route path="/metrics" element={<ApiMetrics />} />
              <Route path="/storage" element={<StorageManagement />} />
              <Route path="/alerts" element={<AlertsLogs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/provisioning" element={<Provisioning />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  )
}

export default App