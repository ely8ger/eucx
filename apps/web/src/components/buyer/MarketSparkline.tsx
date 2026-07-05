"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DATA = [
  { time: "09:00", umsatz: 2.1 },
  { time: "10:00", umsatz: 4.8 },
  { time: "11:00", umsatz: 6.2 },
  { time: "12:00", umsatz: 5.4 },
  { time: "13:00", umsatz: 7.9 },
  { time: "14:00", umsatz: 11.3 },
  { time: "15:00", umsatz: 9.6 },
  { time: "16:00", umsatz: 8.7 },
  { time: "17:00", umsatz: 4.2 },
  { time: "jetzt", umsatz: 2.9 },
];

export function MarketSparkline() {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}M`} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
            formatter={(v) => [`€ ${v} Mio.`, "Umsatz"] as [string, string]}
          />
          <Area type="monotone" dataKey="umsatz" stroke="#2563eb" strokeWidth={2} fill="url(#grad)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: "#2563eb" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
