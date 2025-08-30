import React from 'react';
interface StatusBadgeProps {
    status: 'healthy' | 'warning' | 'error' | 'active' | 'inactive' | 'pending' | 'running' | 'completed' | 'failed';
    pulse?: boolean;
}
export default function StatusBadge({ status, pulse }: StatusBadgeProps): React.JSX.Element;
export {};
//# sourceMappingURL=StatusBadge.d.ts.map