"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const Sidebar_1 = __importDefault(require("./components/layout/Sidebar"));
const Header_1 = __importDefault(require("./components/layout/Header"));
const Overview_1 = __importDefault(require("./pages/Overview"));
const BasesManagement_1 = __importDefault(require("./pages/BasesManagement"));
const QueueMonitor_1 = __importDefault(require("./pages/QueueMonitor"));
const SyncStatus_1 = __importDefault(require("./pages/SyncStatus"));
const ApiMetrics_1 = __importDefault(require("./pages/ApiMetrics"));
const StorageManagement_1 = __importDefault(require("./pages/StorageManagement"));
const AlertsLogs_1 = __importDefault(require("./pages/AlertsLogs"));
const Settings_1 = __importDefault(require("./pages/Settings"));
function App() {
    const [sidebarCollapsed, setSidebarCollapsed] = (0, react_1.useState)(false);
    const [darkMode, setDarkMode] = (0, react_1.useState)(false);
    return ((0, jsx_runtime_1.jsx)("div", { className: `min-h-screen ${darkMode ? 'dark' : ''}`, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex bg-gray-50 dark:bg-gray-950", children: [(0, jsx_runtime_1.jsx)(Sidebar_1.default, { collapsed: sidebarCollapsed, onToggle: () => setSidebarCollapsed(!sidebarCollapsed) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 flex flex-col min-h-screen", children: [(0, jsx_runtime_1.jsx)(Header_1.default, { darkMode: darkMode, onToggleDarkMode: () => setDarkMode(!darkMode) }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 p-6 overflow-auto custom-scrollbar", children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.Routes, { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(Overview_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/bases", element: (0, jsx_runtime_1.jsx)(BasesManagement_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/queue", element: (0, jsx_runtime_1.jsx)(QueueMonitor_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/sync", element: (0, jsx_runtime_1.jsx)(SyncStatus_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/metrics", element: (0, jsx_runtime_1.jsx)(ApiMetrics_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/storage", element: (0, jsx_runtime_1.jsx)(StorageManagement_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/alerts", element: (0, jsx_runtime_1.jsx)(AlertsLogs_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/settings", element: (0, jsx_runtime_1.jsx)(Settings_1.default, {}) })] }) })] })] }) }));
}
exports.default = App;
//# sourceMappingURL=App.js.map