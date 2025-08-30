import React from 'react';
import { LucideIcon } from 'lucide-react';
interface MetricCardProps {
    title: string;
    value: string | number;
    change?: {
        value: number;
        type: 'increase' | 'decrease';
        period: string;
    };
    icon: LucideIcon;
    status?: 'healthy' | 'warning' | 'error';
    onClick?: () => void;
}
export default function MetricCard({ title, value, change, icon: Icon, status, onClick }: MetricCardProps): React.JSX.Element;
export {};
//# sourceMappingURL=MetricCard.d.ts.map