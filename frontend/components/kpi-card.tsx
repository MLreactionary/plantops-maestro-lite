type KpiCardProps = {
  label: string;
  value: string;
  meta?: string;
};

export default function KpiCard({ label, value, meta }: KpiCardProps) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {meta ? <div className="kpi-meta">{meta}</div> : null}
    </div>
  );
}
