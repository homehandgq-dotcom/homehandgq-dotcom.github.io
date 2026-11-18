"use client";

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#071B3A", "#C7A574", "#5d7aa4", "#9c7847", "#93a8c8", "#e2d0a8", "#16305a", "#d3b97e"];

export function TrendLineChart({ data, dataKey, xKey }: { data: Record<string, string | number>[]; dataKey: string; xKey: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf3" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey={dataKey} stroke="#071B3A" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SimpleBarChart({ data, dataKey, xKey }: { data: Record<string, string | number>[]; dataKey: string; xKey: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf3" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey={dataKey} fill="#071B3A" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SimplePieChart({ data, dataKey, nameKey }: { data: Record<string, string | number>[]; dataKey: string; nameKey: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={90} label>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
