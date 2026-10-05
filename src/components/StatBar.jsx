function StatBar({ label, value, color, max = 180 }) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="stat-bar-row">
      <span className="stat-bar-label">{label}</span>
      <div className="stat-bar-track">
        <div
          className="stat-bar-fill"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
      <span className="stat-bar-value">{value}</span>
    </div>
  );
}

export default StatBar;
