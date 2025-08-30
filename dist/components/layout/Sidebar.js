"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Sidebar;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const lucide_react_1 = require("lucide-react");
const navigation = [
    { name: 'Overview', href: '/', icon: lucide_react_1.LayoutDashboard },
    { name: 'Bases', href: '/bases', icon: lucide_react_1.Database },
    { name: 'Queue Monitor', href: '/queue', icon: lucide_react_1.Clock },
    { name: 'Sync Status', href: '/sync', icon: lucide_react_1.RefreshCw },
    { name: 'API Metrics', href: '/metrics', icon: lucide_react_1.BarChart3 },
    { name: 'Storage', href: '/storage', icon: lucide_react_1.HardDrive },
    { name: 'Alerts & Logs', href: '/alerts', icon: lucide_react_1.AlertTriangle },
    { name: 'Settings', href: '/settings', icon: lucide_react_1.Settings },
];
function Sidebar({ collapsed, onToggle }) {
    const location = (0, react_router_dom_1.useLocation)();
    return ((0, jsx_runtime_1.jsx)("div", { className: `${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out`, children: (0, jsx_runtime_1.jsxs)("div", { className: "h-full glass border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-4 border-b border-gray-200/50 dark:border-gray-700/50", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [!collapsed && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Zap, { className: "w-5 h-5 text-white" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-lg font-bold text-gray-900 dark:text-white", children: "Bridge" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Platform Monitor" })] })] })), (0, jsx_runtime_1.jsx)("button", { onClick: onToggle, className: "p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors", children: collapsed ? ((0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { className: "w-4 h-4 text-gray-500" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.ChevronLeft, { className: "w-4 h-4 text-gray-500" })) })] }) }), (0, jsx_runtime_1.jsx)("nav", { className: "flex-1 p-4 space-y-2", children: navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        const Icon = item.icon;
                        return ((0, jsx_runtime_1.jsxs)(react_router_dom_1.Link, { to: item.href, className: `nav-item ${isActive ? 'active' : ''}`, title: collapsed ? item.name : undefined, children: [(0, jsx_runtime_1.jsx)(Icon, { className: "w-5 h-5 flex-shrink-0" }), !collapsed && ((0, jsx_runtime_1.jsx)("span", { className: "ml-3 text-sm font-medium", children: item.name }))] }, item.name));
                    }) }), (0, jsx_runtime_1.jsx)("div", { className: "p-4 border-t border-gray-200/50 dark:border-gray-700/50", children: !collapsed && ((0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [(0, jsx_runtime_1.jsx)("p", { children: "Airtable Bridge v1.0.0" }), (0, jsx_runtime_1.jsx)("p", { children: "\u00A9 2025 Bridge Platform" })] })) })] }) }));
}
//# sourceMappingURL=Sidebar.js.map