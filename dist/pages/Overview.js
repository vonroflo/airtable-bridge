"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Overview;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const recharts_1 = require("recharts");
const MetricCard_1 = __importDefault(require("../components/ui/MetricCard"));
const StatusBadge_1 = __importDefault(require("../components/ui/StatusBadge"));
const LoadingSpinner_1 = __importDefault(require("../components/ui/LoadingSpinner"));
const useSystemHealth_1 = require("../hooks/useSystemHealth");
const useBases_1 = require("../hooks/useBases");
// Mock data for demonstration
const mockApiData = [
    { time: '00:00', requests: 45, errors: 2 },
    { time: '04:00', requests: 32, errors: 1 },
    { time: '08:00', requests: 78, errors: 3 },
    { time: '12:00', requests: 95, errors: 5 },
    { time: '16:00', requests: 87, errors: 2 },
    { time: '20:00', requests: 65, errors: 1 },
];
const mockQueueData = [
    { time: '00:00', depth: 12 },
    { time: '04:00', depth: 8 },
    { time: '08:00', depth: 25 },
    { time: '12:00', depth: 35 },
    { time: '16:00', depth: 28 },
    { time: '20:00', depth: 15 },
];
const mockBaseActivity = [
    { name: 'CRM Base', value: 35, color: '#3b82f6' },
    { name: 'Inventory', value: 25, color: '#10b981' },
    { name: 'Projects', value: 20, color: '#f59e0b' },
    { name: 'HR Data', value: 15, color: '#ef4444' },
    { name: 'Other', value: 5, color: '#6b7280' },
];
function Overview() {
    const { data: health, isLoading: healthLoading } = (0, useSystemHealth_1.useSystemHealth)();
    const { data: basesData, isLoading: basesLoading } = (0, useBases_1.useBases)(1, 100, true);
    if (healthLoading || basesLoading) {
        return (<div className="flex items-center justify-center h-64">
        <LoadingSpinner_1.default size="lg"/>
      </div>);
    }
    const activeBases = basesData?.bases?.filter(base => base.isActive) || [];
    const totalRecords = activeBases.reduce((sum, base) => sum + (base._count?.tables || 0), 0);
    return (<div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            System Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time monitoring of your Airtable Bridge Platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <StatusBadge_1.default status={health?.status || 'error'} pulse/>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard_1.default title="System Status" value={health?.status === 'healthy' ? 'Healthy' : 'Issues'} icon={lucide_react_1.Activity} status={health?.status || 'error'} change={{ value: 0, type: 'increase', period: 'last hour' }}/>
        
        <MetricCard_1.default title="Active Bases" value={activeBases.length} icon={lucide_react_1.Database} status="healthy" change={{ value: 5, type: 'increase', period: 'last week' }}/>
        
        <MetricCard_1.default title="Queue Depth" value={42} icon={lucide_react_1.Clock} status="warning" change={{ value: 12, type: 'increase', period: 'last hour' }}/>
        
        <MetricCard_1.default title="Sync Operations" value={8} icon={lucide_react_1.Zap} status="healthy" change={{ value: 3, type: 'decrease', period: 'last hour' }}/>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard_1.default title="Avg Response Time" value="245ms" icon={lucide_react_1.TrendingUp} status="healthy" change={{ value: 8, type: 'decrease', period: 'last hour' }}/>
        
        <MetricCard_1.default title="Requests/Min" value={1247} icon={lucide_react_1.Server} status="healthy" change={{ value: 15, type: 'increase', period: 'last hour' }}/>
        
        <MetricCard_1.default title="Error Rate" value="0.3%" icon={lucide_react_1.AlertCircle} status="healthy" change={{ value: 0.1, type: 'decrease', period: 'last hour' }}/>
        
        <MetricCard_1.default title="Storage Used" value="2.4GB" icon={lucide_react_1.HardDrive} status="warning" change={{ value: 12, type: 'increase', period: 'last week' }}/>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Request Rate */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            API Request Rate
          </h3>
          <recharts_1.ResponsiveContainer width="100%" height={300}>
            <recharts_1.LineChart data={mockApiData}>
              <recharts_1.CartesianGrid strokeDasharray="3 3" className="opacity-30"/>
              <recharts_1.XAxis dataKey="time" className="text-xs"/>
              <recharts_1.YAxis className="text-xs"/>
              <recharts_1.Tooltip contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
        }}/>
              <recharts_1.Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}/>
              <recharts_1.Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}/>
            </recharts_1.LineChart>
          </recharts_1.ResponsiveContainer>
        </div>

        {/* Queue Depth */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Queue Depth
          </h3>
          <recharts_1.ResponsiveContainer width="100%" height={300}>
            <recharts_1.AreaChart data={mockQueueData}>
              <recharts_1.CartesianGrid strokeDasharray="3 3" className="opacity-30"/>
              <recharts_1.XAxis dataKey="time" className="text-xs"/>
              <recharts_1.YAxis className="text-xs"/>
              <recharts_1.Tooltip contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
        }}/>
              <recharts_1.Area type="monotone" dataKey="depth" stroke="#10b981" fill="#10b981" fillOpacity={0.3}/>
            </recharts_1.AreaChart>
          </recharts_1.ResponsiveContainer>
        </div>
      </div>

      {/* Base Activity and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Base Activity Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Base Activity Distribution
          </h3>
          <recharts_1.ResponsiveContainer width="100%" height={300}>
            <recharts_1.PieChart>
              <recharts_1.Pie data={mockBaseActivity} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {mockBaseActivity.map((entry, index) => (<recharts_1.Cell key={`cell-${index}`} fill={entry.color}/>))}
              </recharts_1.Pie>
              <recharts_1.Tooltip />
            </recharts_1.PieChart>
          </recharts_1.ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {mockBaseActivity.map((item, index) => (<div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}/>
                  <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.value}%
                </span>
              </div>))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[
            { type: 'sync', message: 'CRM Base sync completed', time: '2 minutes ago', status: 'completed' },
            { type: 'batch', message: 'Batch operation processed 150 records', time: '5 minutes ago', status: 'completed' },
            { type: 'alert', message: 'Queue depth exceeded threshold', time: '12 minutes ago', status: 'warning' },
            { type: 'sync', message: 'Inventory sync started', time: '15 minutes ago', status: 'running' },
            { type: 'base', message: 'New base registered: Projects', time: '1 hour ago', status: 'completed' },
        ].map((activity, index) => (<div key={index} className="flex items-center justify-between py-2 border-b border-gray-200/50 dark:border-gray-700/50 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
                <StatusBadge_1.default status={activity.status}/>
              </div>))}
          </div>
        </div>
      </div>

      {/* Active Bases Summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Active Bases Summary
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {activeBases.length} active bases
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Base</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Tables</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Rate Limit</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Last Sync</th>
              </tr>
            </thead>
            <tbody>
              {activeBases.slice(0, 5).map((base) => (<tr key={base.id} className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {base.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {base.baseId}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge_1.default status={base.isActive ? 'active' : 'inactive'}/>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {base._count?.tables || 0}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {base.rateLimitRpm}/min
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(base.updatedAt).toLocaleTimeString()}
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=Overview.js.map