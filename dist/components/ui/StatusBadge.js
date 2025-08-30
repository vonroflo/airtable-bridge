"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StatusBadge;
const jsx_runtime_1 = require("react/jsx-runtime");
function StatusBadge({ status, pulse = false }) {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'healthy':
            case 'active':
            case 'completed':
                return {
                    className: 'status-healthy',
                    text: status.charAt(0).toUpperCase() + status.slice(1)
                };
            case 'warning':
            case 'pending':
                return {
                    className: 'status-warning',
                    text: status.charAt(0).toUpperCase() + status.slice(1)
                };
            case 'error':
            case 'failed':
            case 'inactive':
                return {
                    className: 'status-error',
                    text: status.charAt(0).toUpperCase() + status.slice(1)
                };
            case 'running':
                return {
                    className: 'status-warning',
                    text: 'Running'
                };
            default:
                return {
                    className: 'status-indicator bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                    text: status.charAt(0).toUpperCase() + status.slice(1)
                };
        }
    };
    const config = getStatusConfig(status);
    return ((0, jsx_runtime_1.jsxs)("span", { className: `${config.className} ${pulse ? 'animate-pulse-slow' : ''}`, children: [pulse && ((0, jsx_runtime_1.jsx)("span", { className: "w-2 h-2 bg-current rounded-full mr-1.5 animate-pulse" })), config.text] }));
}
//# sourceMappingURL=StatusBadge.js.map