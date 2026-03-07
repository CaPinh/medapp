type Status = 'scheduled' | 'confirmed' | 'cancelled' | 'completed'

const MAP: Record<Status, { label: string; cls: string }> = {
  scheduled:  { label: 'Agendado',  cls: 'badge-scheduled' },
  confirmed:  { label: 'Confirmado', cls: 'badge-confirmed' },
  cancelled:  { label: 'Cancelado', cls: 'badge-cancelled' },
  completed:  { label: 'Realizado', cls: 'badge-completed' },
}

export default function StatusBadge({ status }: { status: Status }) {
  const { label, cls } = MAP[status] || MAP.scheduled
  return <span className={cls}>{label}</span>
}
