type ChartPoint = {
  label: string;
  value: number;
};

type LineChartProps = {
  title: string;
  subtitle?: string;
  points: ChartPoint[];
  unit?: string;
};

export default function LineChart({
  title,
  subtitle,
  points,
  unit = "",
}: LineChartProps) {
  const width = 640;
  const height = 240;
  const padding = 28;

  if (points.length === 0) {
    return (
      <section className="card">
        <h2 className="card-title">{title}</h2>
        {subtitle ? <p className="card-subtitle">{subtitle}</p> : null}
        <div className="empty-state">
          <div className="incident-title">No trend data available</div>
          <div className="incident-meta">
            The timeseries endpoint returned no usable rows.
          </div>
        </div>
      </section>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const stepX =
    points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;

  const coords = points.map((point, index) => {
    const x = padding + index * stepX;
    const y =
      height - padding - ((point.value - min) / range) * (height - padding * 2);
    return { x, y, ...point };
  });

  const polyline = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const midValue = ((min + max) / 2).toFixed(1);

  return (
    <section className="card">
      <h2 className="card-title">{title}</h2>
      {subtitle ? <p className="card-subtitle">{subtitle}</p> : null}

      <div className="chart-shell">
        <div className="chart-axis-label top">
          {max.toFixed(1)}
          {unit}
        </div>
        <div className="chart-axis-label middle">
          {midValue}
          {unit}
        </div>
        <div className="chart-axis-label bottom">
          {min.toFixed(1)}
          {unit}
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="chart-svg"
          role="img"
          aria-label={title}
        >
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            className="chart-axis"
          />
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            className="chart-axis"
          />

          <line
            x1={padding}
            y1={padding}
            x2={width - padding}
            y2={padding}
            className="chart-grid"
          />
          <line
            x1={padding}
            y1={height / 2}
            x2={width - padding}
            y2={height / 2}
            className="chart-grid"
          />
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            className="chart-grid"
          />

          <polyline points={polyline} fill="none" className="chart-line" />

          {coords.map((c) => (
            <g key={`${c.label}-${c.x}`}>
              <circle cx={c.x} cy={c.y} r="4" className="chart-point" />
            </g>
          ))}
        </svg>

        <div className="chart-xlabels">
          {points.map((point) => (
            <span key={point.label}>{point.label}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
