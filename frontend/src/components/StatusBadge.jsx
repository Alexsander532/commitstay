const LABELS = {
  PENDING: ["Pendente", "badge-pending"],
  APPROVED: ["Aprovada", "badge-approved"],
  REJECTED: ["Recusada", "badge-rejected"],
  CANCELLED: ["Cancelada", "badge-cancelled"],
};

export default function StatusBadge({ status }) {
  const [label, cls] = LABELS[status] || [status, "badge-cancelled"];
  return <span className={`badge ${cls}`}>{label}</span>;
}
