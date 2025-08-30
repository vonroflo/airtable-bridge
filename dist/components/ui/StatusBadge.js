"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StatusBadge;
const react_1 = __importDefault(require("react"));
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
    return (<span className={`${config.className} ${pulse ? 'animate-pulse-slow' : ''}`}>
      {pulse && (<span className="w-2 h-2 bg-current rounded-full mr-1.5 animate-pulse"></span>)}
      {config.text}
    </span>);
}
//# sourceMappingURL=StatusBadge.js.map