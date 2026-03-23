"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Props {
  data: { month: string; price: number }[];
  unit?: string;
  color?: string;
}

export function PriceChart({ data, unit = "€/t", color = "#154194" }: Props) {
  const prices = data.map(d => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const pad = Math.ceil((max - min) * 0.1);

  return (
    <div style={{ width: "100%", height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="2 2" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: "#aaa", fontFamily: "'IBM Plex Mono', monospace" }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            domain={[min - pad, max + pad]}
            tick={{ fontSize: 10, fill: "#aaa", fontFamily: "'IBM Plex Mono', monospace" }}
            axisLine={false} tickLine={false} width={48}
          />
          <Tooltip
            formatter={(val: unknown) => [`${Number(val).toLocaleString("de-DE")} ${unit}`, "Preis"]}
            labelStyle={{ fontSize: 11, color: "#555" }}
            contentStyle={{ border: "1px solid #e8e8e8", borderRadius: 0, fontSize: 12 }}
          />
          <Line type="monotone" dataKey="price" stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 3, fill: color }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
