"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MetricCard;
const jsx_runtime_1 = require("react/jsx-runtime");
function MetricCard({ title, value, change, icon: Icon, status = 'healthy', onClick }) {
    const statusColors = {
        healthy: 'text-green-600 dark:text-green-400',
        warning: 'text-yellow-600 dark:text-yellow-400',
        error: 'text-red-600 dark:text-red-400'
    };
    const changeColors = {
        increase: 'text-green-600 dark:text-green-400',
        decrease: 'text-red-600 dark:text-red-400'
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: `metric-card ${onClick ? 'cursor-pointer' : ''}`, onClick: onClick, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-1", children: title }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-2", children: typeof value === 'number' ? value.toLocaleString() : value }), change && ((0, jsx_runtime_1.jsxs)("p", { className: `text-xs ${changeColors[change.type]}`, children: [change.type === 'increase' ? '+' : '-', Math.abs(change.value), "%", (0, jsx_runtime_1.jsxs)("span", { className: "text-gray-500 ml-1", children: ["vs ", change.period] })] }))] }), (0, jsx_runtime_1.jsx)("div", { className: `p-3 rounded-lg bg-gray-100 dark:bg-gray-800 ${statusColors[status]}`, children: (0, jsx_runtime_1.jsx)(Icon, { className: "w-6 h-6" }) })] }) }));
}
//# sourceMappingURL=MetricCard.js.map