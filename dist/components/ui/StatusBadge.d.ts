interface StatusBadgeProps {
    status: 'healthy' | 'warning' | 'error' | 'active' | 'inactive' | 'pending' | 'running' | 'completed' | 'failed';
    pulse?: boolean;
}
export default function StatusBadge({ status, pulse }: StatusBadgeProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=StatusBadge.d.ts.map