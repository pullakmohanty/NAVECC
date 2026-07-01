"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { nhsStaffHours } from "@/data/mockData";
import { chartDefaults } from "@/lib/design-system";

// Sequential amber ramp (darkest = most hours lost) to match the "NHS staff
// hours lost" KPI colour - same metric, same colour identity across the app.
const barColors = ["#B25900", "#DB7B00", "#F2A52E", "#FFC766"];

export default function StaffHoursChart({ data }: { data?: { label: string; hours: number }[] }) {
  // Sort descending so the ramp maps darkest = most hours, whatever the input order.
  const rows = [...(data ?? nhsStaffHours)].sort((a, b) => b.hours - a.hours);
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 48, left: 0, bottom: 0 }} barSize={16}>
        <CartesianGrid strokeDasharray="" stroke={chartDefaults.gridColor} strokeWidth={0.5} horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: chartDefaults.fontSize, fill: chartDefaults.tickColor, fontFamily: chartDefaults.fontFamily }}
          axisLine={false} tickLine={false}
          tickFormatter={(v) => `${v}h`}
        />
        <YAxis
          type="category" dataKey="label"
          tick={{ fontSize: chartDefaults.fontSize, fill: chartDefaults.tickColor, fontFamily: chartDefaults.fontFamily }}
          axisLine={false} tickLine={false} width={150}
        />
        <Tooltip
          contentStyle={chartDefaults.tooltipStyle}
          labelStyle={chartDefaults.tooltipLabelStyle}
          itemStyle={chartDefaults.tooltipItemStyle}
          formatter={(v) => [`${v}h`, "Hours lost"]}
        />
        <Bar dataKey="hours" radius={[0, 3, 3, 0]}>
          {rows.map((_, i) => <Cell key={i} fill={barColors[i % barColors.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
