'use client';
// Monochrome horizontal bar chart for code-frequency stats (Recharts).
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function FrequencyBars({ data }: { data: { label: string; value: number }[] }) {
  if (!data.length) {
    return <p className="py-10 text-center text-sm text-[var(--ink-faint)]">Run an analysis to populate this chart.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 20, top: 4, bottom: 4 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={132}
          tick={{ fontSize: 12, fill: '#6b6b76' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          contentStyle={{ borderRadius: 12, border: '1px solid #ececec', fontSize: 12, boxShadow: '0 8px 24px -12px rgba(0,0,0,0.18)' }}
          labelStyle={{ color: '#0d0d0d', fontWeight: 600 }}
        />
        <Bar dataKey="value" radius={[4, 4, 4, 4]} fill="#0d0d0d" maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}
