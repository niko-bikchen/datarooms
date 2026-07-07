import type { LucideIcon } from "lucide-react";
import "./EmptyState.scss";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="emptyState">
      <Icon className="emptyStateIcon" />
      <p className="emptyStateTitle">{title}</p>
      <p className="emptyStateDescription">{description}</p>
      {action && <div className="emptyStateAction">{action}</div>}
    </div>
  );
}
