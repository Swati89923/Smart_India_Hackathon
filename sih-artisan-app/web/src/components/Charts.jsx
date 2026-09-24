// Lightweight SVG charts (no chart library) for the admin dashboard.
import { useState } from "react";

export const SERIES = ["#2F6FD6", "#2F9E5B", "#E7892F", "#D9534F", "#8B5CF6", "#14A3A3", "#A16207"];

export function LineChart({ data, series, height = 180 }) {
  const [hover, setHover] = useState(null);
  const W = 520;
  const H = height;
  const pad = { l: 34, r: 12, t: 12, b: 26 };
  const max = Math.max(1, ...data.flatMap((d) => series.map((s) => d[s.key])));
  const niceMax = Math.ceil(max / 2) * 2;
  const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, data.length - 1);
  const y = (v) => H - pad.b - (v / niceMax) * (H - pad.t - pad.b);
  const ticks = [0, niceMax / 2, niceMax];

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Platform growth line chart" onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="grid" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="axis">{t}</text>
          </g>
        ))}
        {data.map((d, i) => (
          <text key={d.label} x={x(i)} y={H - 6} textAnchor="middle" className="axis">{d.label}</text>
        ))}
        {series.map((s, si) => (
          <g key={s.key}>
            <polyline fill="none" stroke={s.color || SERIES[si]} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
              points={data.map((d, i) => `${x(i)},${y(d[s.key])}`).join(" ")} />
            {data.map((d, i) => (
              <circle key={i} cx={x(i)} cy={y(d[s.key])} r={hover === i ? 5 : 3.5} fill="#fff" stroke={s.color || SERIES[si]} strokeWidth="2" />
            ))}
          </g>
        ))}
        {data.map((d, i) => (
          <rect key={i} x={x(i) - 20} y={pad.t} width="40" height={H - pad.t - pad.b} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
        {hover != null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} className="crosshair" />}
      </svg>
      {hover != null && (
        <div className="chart-tip" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <b>{data[hover].label}</b>
          {series.map((s, si) => (
            <span key={s.key}><i style={{ background: s.color || SERIES[si] }} />{s.label}: {data[hover][s.key]}</span>
          ))}
        </div>
      )}
      <div className="legend">
        {series.map((s, si) => (
          <span key={s.key}><i style={{ background: s.color || SERIES[si] }} />{s.label}</span>
        ))}
      </div>
    </div>
  );
}

export function Donut({ data, size = 170, label }) {
  const [hover, setHover] = useState(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 60;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox="0 0 160 160" role="img" aria-label={label}>
        <circle cx="80" cy="80" r={r} fill="none" stroke="#EEF1F4" strokeWidth="26" />
        {data.map((d, i) => {
          const len = (d.value / total) * c;
          const el = (
            <circle key={d.name} cx="80" cy="80" r={r} fill="none" stroke={SERIES[i % SERIES.length]}
              strokeWidth={hover === i ? 30 : 26} strokeDasharray={`${Math.max(0, len - 2)} ${c}`} strokeDashoffset={-offset}
              transform="rotate(-90 80 80)" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
          );
          offset += len;
          return el;
        })}
        <text x="80" y="76" textAnchor="middle" className="donut-num">{hover != null ? data[hover].value : total}</text>
        <text x="80" y="96" textAnchor="middle" className="donut-lbl">{hover != null ? data[hover].name : "total"}</text>
      </svg>
      <ul className="donut-legend">
        {data.map((d, i) => (
          <li key={d.name} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <i style={{ background: SERIES[i % SERIES.length] }} />
            <span>{d.name}</span>
            <b>{Math.round((d.value / total) * 100)}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BarList({ data, color = "#2F6FD6", unit = "" }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="barlist">
      {data.map((d) => (
        <li key={d.name}>
          <span className="barlist-name">{d.name}</span>
          <span className="barlist-track">
            <span className="barlist-fill" style={{ width: `${(d.value / max) * 100}%`, background: color }} />
          </span>
          <b>{d.value}{unit}</b>
        </li>
      ))}
    </ul>
  );
}
