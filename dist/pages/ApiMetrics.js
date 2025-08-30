"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ApiMetrics;
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const recharts_1 = require("recharts");
const MetricCard_1 = __importDefault(require("../components/ui/MetricCard"));
// Mock data for demonstration
const mockPerformanceData = [
    { time: '00:00', responseTime: 245, requests: 45, errors: 2 },
    { time: '04:00', responseTime: 198, requests: 32, errors: 1 },
    { time: '08:00', responseTime: 312, requests: 78, errors: 3 },
    { time: '12:00', responseTime: 278, requests: 95, errors: 5 },
    { time: '16:00', responseTime: 234, requests: 87, errors: 2 },
    { time: '20:00', responseTime: 189, requests: 65, errors: 1 },
];
const mockEndpointMetrics = [
    { endpoint: '/records', requests: 1247, avgTime: 245, errors: 12 },
    { endpoint: '/bases', requests: 89, avgTime: 156, errors: 1 },
    { endpoint: '/sync', requests: 234, avgTime: 1200, errors: 8 },
    { endpoint: '/batch', requests: 567, avgTime: 890, errors: 5 },
];
function ApiMetrics() {
    const [selectedPeriod, setSelectedPeriod] = (0, react_1.useState)('24h');
    return (<div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            API Metrics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor API performance and usage patterns
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard_1.default title="Avg Response Time" value="245ms" icon={lucide_react_1.Clock} status="healthy" change={{ value: 8, type: 'decrease', period: 'last hour' }}/>
        
        <MetricCard_1.default title="Requests/Min" value={1247} icon={lucide_react_1.TrendingUp} status="healthy" change={{ value: 15, type: 'increase', period: 'last hour' }}/>
        
        <MetricCard_1.default title="Error Rate" value="0.3%" icon={lucide_react_1.AlertCircle} status="healthy" change={{ value: 0.1, type: 'decrease', period: 'last hour' }}/>
        
        <MetricCard_1.default title="Cache Hit Rate" value="87.2%" icon={lucide_react_1.BarChart3} status="healthy" change={{ value: 2.1, type: 'increase', period: 'last hour' }}/>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Response Time Trend
          </h3>
          <recharts_1.ResponsiveContainer width="100%" height={300}>
            <recharts_1.LineChart data={mockPerformanceData}>
              <recharts_1.CartesianGrid strokeDasharray="3 3" className="opacity-30"/>
              <recharts_1.XAxis dataKey="time" className="text-xs"/>
              <recharts_1.YAxis className="text-xs" label={{ value: 'ms', angle: -90, position: 'insideLeft' }}/>
              <recharts_1.Tooltip contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
        }}/>
              <recharts_1.Line type="monotone" dataKey="responseTime" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}/>
            </recharts_1.LineChart>
          </recharts_1.ResponsiveContainer>
        </div>

        {/* Request Volume */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Request Volume & Errors
          </h3>
          <recharts_1.ResponsiveContainer width="100%" height={300}>
            <recharts_1.BarChart data={mockPerformanceData}>
              <recharts_1.CartesianGrid strokeDasharray="3 3" className="opacity-30"/>
              <recharts_1.XAxis dataKey="time" className="text-xs"/>
              <recharts_1.YAxis className="text-xs"/>
              <recharts_1.Tooltip contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
        }}/>
              <recharts_1.Bar dataKey="requests" fill="#10b981" name="Requests"/>
              <recharts_1.Bar dataKey="errors" fill="#ef4444" name="Errors"/>
            </recharts_1.BarChart>
          </recharts_1.ResponsiveContainer>
        </div>
      </div>

      {/* Endpoint Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Endpoint Performance
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Endpoint</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Requests</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Errors</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Error Rate</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Performance</th>
              </tr>
            </thead>
            <tbody>
              {mockEndpointMetrics.map((endpoint, index) => {
            const errorRate = (endpoint.errors / endpoint.requests) * 100;
            const performanceStatus = endpoint.avgTime < 300 ? 'healthy' : endpoint.avgTime < 1000 ? 'warning' : 'error';
            return (<tr key={index} className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {endpoint.endpoint}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {endpoint.requests.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {endpoint.avgTime}ms
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {endpoint.errors}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm ${errorRate > 5 ? 'text-red-600 dark:text-red-400' : errorRate > 1 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                        {errorRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${performanceStatus === 'healthy' ? 'bg-green-500' :
                    performanceStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}/>
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {performanceStatus}
                        </span>
                      </div>
                    </td>
                  </tr>);
        })}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=ApiMetrics.js.map