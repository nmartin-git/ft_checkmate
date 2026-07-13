'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { useTranslations } from "next-intl"

interface WinRateChartProps {
    wins: number;
    losses: number;
    draws: number;
    winrate: number;
}

const SURFACE = "#1e1c18"; // couleur de la carte, sert d'interstice entre les parts

const SLICES = [
    { key: "wins", labelKey: "wins", color: "#81b64c" },
    { key: "losses", labelKey: "losses", color: "#e5484d" },
    { key: "draws", labelKey: "draws", color: "#e6912c" },
] as const;

interface Slice {
    label: string;
    value: number;
    color: string;
}

function ChartTooltip({ active, payload, total }: { active?: boolean; payload?: { payload: Slice }[]; total: number }) {
    if (!active || !payload || payload.length === 0) return null;
    const slice = payload[0].payload;
    const pct = total ? Math.round((slice.value / total) * 100) : 0;
    return (
        <div className="bg-[#1e1c18] border border-[#2b2925] rounded-lg px-3 py-2 text-xs shadow-xl">
            <span className="inline-block w-2 h-2 rounded-full mr-2 align-middle" style={{ background: slice.color }} />
            <span className="font-black uppercase tracking-wide text-white">{slice.label}</span>
            <span className="text-gray-400 ml-2 font-mono">{slice.value} ({pct}%)</span>
        </div>
    );
}

export default function WinRateChart({ wins, losses, draws, winrate }: WinRateChartProps) {
    const t = useTranslations("chart");
    const total = wins + losses + draws;

    if (total === 0) {
        return (
            <p className="text-sm text-gray-500 font-medium py-8 text-center">{t("no_games")}</p>
        );
    }

    const values: Record<string, number> = { wins, losses, draws };
    const data: Slice[] = SLICES.map((s) => ({ label: t(s.labelKey), value: values[s.key], color: s.color }));

    return (
        <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Camembert (donut) avec le taux de victoire au centre */}
            <div className="relative w-full md:w-1/2 max-w-[240px]" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="label"
                            cx="50%"
                            cy="50%"
                            innerRadius={62}
                            outerRadius={90}
                            paddingAngle={2}
                            startAngle={90}
                            endAngle={-270}
                            stroke={SURFACE}
                            strokeWidth={2}
                            isAnimationActive={false}
                        >
                            {data.map((slice) => (
                                <Cell key={slice.label} fill={slice.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip total={total} />} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-white leading-none">{Math.round(winrate * 100)}%</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 mt-1">{t("wins")}</span>
                </div>
            </div>

            {/* Légende chiffrée (encodage secondaire : identité pas uniquement par la couleur) */}
            <ul className="w-full md:w-1/2 space-y-2">
                {data.map((slice) => {
                    const pct = total ? Math.round((slice.value / total) * 100) : 0;
                    return (
                        <li key={slice.label} className="flex items-center gap-3 text-sm">
                            <span className="inline-block w-3 h-3 rounded-sm shrink-0" style={{ background: slice.color }} />
                            <span className="font-bold text-gray-200 flex-1">{slice.label}</span>
                            <span className="font-mono text-white font-bold">{slice.value}</span>
                            <span className="font-mono text-gray-500 w-10 text-right">{pct}%</span>
                        </li>
                    );
                })}
                <li className="flex items-center gap-3 text-sm border-t border-[#2b2925] pt-2 mt-2">
                    <span className="w-3 h-3 shrink-0" />
                    <span className="font-black uppercase tracking-wider text-gray-400 flex-1 text-xs">{t("total")}</span>
                    <span className="font-mono text-white font-bold">{total}</span>
                    <span className="w-10" />
                </li>
            </ul>
        </div>
    );
}
