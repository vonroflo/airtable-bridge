"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoadingSpinner;
const jsx_runtime_1 = require("react/jsx-runtime");
function LoadingSpinner({ size = 'md', className = '' }) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: `animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizeClasses[size]} ${className}` }));
}
//# sourceMappingURL=LoadingSpinner.js.map