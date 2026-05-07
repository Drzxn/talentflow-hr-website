export default function StatCard({
  label,
  value,
  change,
  colorClass,
}) {
  return (
    <div className={`stat-card ${colorClass}`}>
      <div className="stat-label">
        {label}
      </div>

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-change">
        {change}
      </div>
    </div>
  );
}