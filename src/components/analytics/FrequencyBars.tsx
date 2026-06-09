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
          tick={{ fontSize: 12, fill: '#6f6b62', fontFamily: 'var(--font-accent)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(20,19,16,0.04)' }}
          contentStyle={{ borderRadius: 0, border: '1px solid #e8e5df', background: '#fffefc', fontSize: 12, fontFamily: 'var(--font-accent)' }}
          labelStyle={{ color: '#141310', fontWeight: 600 }}
        />
        <Bar dataKey="value" fill="#141310" maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}
