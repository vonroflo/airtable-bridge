"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SyncStatus;
const jsx_runtime_1 = require("react/jsx-runtime");
const lucide_react_1 = require("lucide-react");
const recharts_1 = require("recharts");
const MetricCard_1 = __importDefault(require("../components/ui/MetricCard"));
const StatusBadge_1 = __importDefault(require("../components/ui/StatusBadge"));
// Mock data for demonstration
const mockSyncMetrics = {
    activeSyncs: 3,
    completedToday: 24,
    averageSyncTime: 45,
    conflictsDetected: 2,
    syncLag: 32,
    successRate: 98.5
};
const mockSyncLagData = [
    { time: '00:00', lag: 25 },
    { time: '04:00', lag: 18 },
    { time: '08:00', lag: 35 },
    { time: '12:00', lag: 42 },
    { time: '16:00', lag: 28 },
    { time: '20:00', lag: 22 },
];
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
];
const mockSyncHistory = [
    { id: 'sync_h_001', baseName: 'CRM Base', type: 'incremental', status: 'completed', duration: '2m 15s', recordsProcessed: 1920, completedAt: '2025-01-27T10:20:00Z' },
    { id: 'sync_h_002', baseName: 'Projects', type: 'full', status: 'completed', duration: '5m 42s', recordsProcessed: 3500, completedAt: '2025-01-27T10:15:00Z' },
    { id: 'sync_h_003', baseName: 'HR Data', type: 'webhook-triggered', status: 'failed', duration: '0m 30s', recordsProcessed: 0, completedAt: '2025-01-27T10:10:00Z' },
];
function SyncStatus() {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6 animate-fade-in", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "Sync Status" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400 mt-1", children: "Monitor bi-directional synchronization operations" })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center space-x-2", children: (0, jsx_runtime_1.jsxs)("button", { className: "flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: "w-4 h-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Trigger Full Sync" })] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [(0, jsx_runtime_1.jsx)(MetricCard_1.default, { title: "Active Syncs", value: mockSyncMetrics.activeSyncs, icon: lucide_react_1.RefreshCw, status: "healthy" }), (0, jsx_runtime_1.jsx)(MetricCard_1.default, { title: "Avg Sync Time", value: `${mockSyncMetrics.averageSyncTime}s`, icon: lucide_react_1.Clock, status: "healthy", change: { value: 8, type: 'decrease', period: 'last week' } }), (0, jsx_runtime_1.jsx)(MetricCard_1.default, { title: "Success Rate", value: `${mockSyncMetrics.successRate}%`, icon: lucide_react_1.CheckCircle, status: "healthy", change: { value: 0.5, type: 'increase', period: 'last week' } })] }), (0, jsx_runtime_1.jsxs)("div", { className: "card", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Sync Lag Over Time" }), (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 300, children: (0, jsx_runtime_1.jsxs)(recharts_1.LineChart, { data: mockSyncLagData, children: [(0, jsx_runtime_1.jsx)(recharts_1.CartesianGrid, { strokeDasharray: "3 3", className: "opacity-30" }), (0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "time", className: "text-xs" }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, { className: "text-xs", label: { value: 'Seconds', angle: -90, position: 'insideLeft' } }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { contentStyle: {
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px'
                                    } }), (0, jsx_runtime_1.jsx)(recharts_1.Line, { type: "monotone", dataKey: "lag", stroke: "#f59e0b", strokeWidth: 2, dot: { fill: '#f59e0b', strokeWidth: 2, r: 4 } })] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "card", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Active Sync Operations" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: [mockActiveSyncs.length, " operations running"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: mockActiveSyncs.map((sync) => ((0, jsx_runtime_1.jsxs)("div", { className: "p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)(StatusBadge_1.default, { status: "running", pulse: true }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: [sync.baseName, " - ", sync.type.toUpperCase(), " SYNC"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 dark:text-gray-400 font-mono", children: sync.id })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-right", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: [sync.recordsProcessed.toLocaleString(), " / ", sync.recordsTotal.toLocaleString()] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: ["ETA: ", new Date(sync.estimatedCompletion).toLocaleTimeString()] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2", children: (0, jsx_runtime_1.jsx)("div", { className: "bg-blue-500 h-2 rounded-full transition-all duration-300", style: { width: `${sync.progress}%` } }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between text-xs text-gray-600 dark:text-gray-400", children: [(0, jsx_runtime_1.jsxs)("span", { children: [sync.progress, "% complete"] }), (0, jsx_runtime_1.jsxs)("span", { children: ["Started ", new Date(sync.startedAt).toLocaleTimeString()] })] })] }, sync.id))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "card", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-6", children: "Recent Sync History" }), (0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "w-full", children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { className: "border-b border-gray-200/50 dark:border-gray-700/50", children: [(0, jsx_runtime_1.jsx)("th", { className: "text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400", children: "Base" }), (0, jsx_runtime_1.jsx)("th", { className: "text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400", children: "Type" }), (0, jsx_runtime_1.jsx)("th", { className: "text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400", children: "Status" }), (0, jsx_runtime_1.jsx)("th", { className: "text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400", children: "Duration" }), (0, jsx_runtime_1.jsx)("th", { className: "text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400", children: "Records" }), (0, jsx_runtime_1.jsx)("th", { className: "text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400", children: "Completed" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: mockSyncHistory.map((sync) => ((0, jsx_runtime_1.jsxs)("tr", { className: "border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors", children: [(0, jsx_runtime_1.jsx)("td", { className: "py-3 px-4 text-sm font-medium text-gray-900 dark:text-white", children: sync.baseName }), (0, jsx_runtime_1.jsx)("td", { className: "py-3 px-4", children: (0, jsx_runtime_1.jsx)("span", { className: "text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full", children: sync.type }) }), (0, jsx_runtime_1.jsx)("td", { className: "py-3 px-4", children: (0, jsx_runtime_1.jsx)(StatusBadge_1.default, { status: sync.status }) }), (0, jsx_runtime_1.jsx)("td", { className: "py-3 px-4 text-sm text-gray-700 dark:text-gray-300", children: sync.duration }), (0, jsx_runtime_1.jsx)("td", { className: "py-3 px-4 text-sm text-gray-700 dark:text-gray-300", children: sync.recordsProcessed.toLocaleString() }), (0, jsx_runtime_1.jsx)("td", { className: "py-3 px-4 text-sm text-gray-500 dark:text-gray-400", children: new Date(sync.completedAt).toLocaleString() })] }, sync.id))) })] }) })] })] }));
}
//# sourceMappingURL=SyncStatus.js.map