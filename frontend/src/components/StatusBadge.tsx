type StatusBadgeProps = {
  label: string;
  tone?: "neutral" | "success" | "warning";
};

export const StatusBadge = ({ label, tone = "neutral" }: StatusBadgeProps) => (
  <span className={`status-badge ${tone}`}>{label}</span>
);

