'use client'

import { useRouter, usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import EloChart from "./EloChart";
import WinRateChart from "./WinRateChart";

interface StatsClientViewProps {
    username: string;
    eloHistory: { date: Date | string; elo: number }[];
    matchHistory: {
        id: string;
        date: Date | string;
        opponent: string | null;
        outcome: 'WIN' | 'LOSS' | 'DRAW';
    }[];
    stats: { winrate: number; wins: number; losses: number; draws: number };
    currentRange: string;
}

export default function StatsClientView({ username, eloHistory, matchHistory, stats, currentRange }: StatsClientViewProps) {
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations();
    const locale = useLocale();
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const ranges = [
        { label: t("stats.range_7"), value: "7" },
        { label: t("stats.range_30"), value: "30" },
        { label: t("stats.range_90"), value: "90" },
        { label: t("stats.range_all"), value: "all" }
    ];

    const handleRangeChange = (value: string) => {
        if (value === "all") {
            router.push(pathname);
        } else {
            router.push(`${pathname}?range=${value}`);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMatches = matchHistory.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(matchHistory.length / itemsPerPage);

    return (
        <div className="min-h-[calc(100vh-100px)] bg-[#262522] text-white p-6 md:p-10 select-none">
            <div className="max-w-4xl mx-auto space-y-6">
                
                <div className="flex items-center justify-between border-b border-[#2b2925] pb-4">
                    <h1 className="text-2xl font-black uppercase tracking-tight">
                        📈 {t("stats.title", { username })}
                    </h1>
                    <button 
                        onClick={() => router.back()}
                        className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white bg-[#1e1c18] border border-[#2b2925] px-3 py-1.5 rounded transition-all"
                    >
                        {t("stats.back_profile")}
                    </button>
                </div>

                <div className="flex gap-2 bg-[#151412] p-1 rounded-lg w-fit border border-[#2b2925]">
                    {ranges.map((r) => {
                        const isActive = currentRange === r.value;
                        return (
                            <button
                                key={r.value}
                                onClick={() => handleRangeChange(r.value)}
                                className={`px-4 py-1.5 rounded text-xs font-black uppercase tracking-wide transition-all ${
                                    isActive 
                                        ? "bg-[#81b64c] text-white shadow-sm" 
                                        : "text-gray-400 hover:text-white"
                                }`}
                            >
                                {r.label}
                            </button>
                        );
                    })}
                </div>

                <div className="bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg p-6 shadow-xl">
                    <p className="text-gray-300 font-black uppercase tracking-wider text-sm mb-4">{t("stats.elo_evolution")}</p>
                    {eloHistory.length === 0 ? (
                        <p className="text-sm text-gray-500 font-medium py-8 text-center">{t("stats.no_data_period")}</p>
                    ) : (
                        <EloChart data={eloHistory} />
                    )}
                </div>

                <div className="bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg p-6 shadow-xl">
                    <p className="text-gray-300 font-black uppercase tracking-wider text-sm mb-4">{t("stats.results_distribution")}</p>
                    <WinRateChart wins={stats.wins} losses={stats.losses} draws={stats.draws} winrate={stats.winrate} />
                </div>

                <div className="bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg p-6 shadow-xl flex flex-col justify-between min-h-[380px]">
                    <div>
                        <p className="text-gray-300 font-black uppercase tracking-wider text-sm mb-4">{t("stats.match_history")}</p>
                        
                        {matchHistory.length === 0 ? (
                            <p className="text-sm text-gray-500 font-medium py-8 text-center">{t("stats.no_matches")}</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-[#2b2925] text-gray-400 text-xs font-black uppercase tracking-wider">
                                            <th className="pb-3">{t("stats.col_date")}</th>
                                            <th className="pb-3">{t("stats.col_opponent")}</th>
                                            <th className="pb-3 text-right">{t("stats.col_result")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#2b2925]/50">
                                        {currentMatches.map((m) => (
                                            <tr key={m.id} className="hover:bg-[#262522]/30 transition-colors">
                                                <td className="py-3 text-gray-400 font-mono text-xs">
                                                    {new Date(m.date).toLocaleDateString(locale, {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="py-3 font-semibold text-white">
                                                    vs {m.opponent ?? "—"}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <span className={`text-xs font-black uppercase px-2 py-0.5 rounded ${
                                                        m.outcome === 'WIN' ? 'bg-[#81b64c]/10 text-[#81b64c]'
                                                        : m.outcome === 'LOSS' ? 'bg-red-500/10 text-red-400' : 'bg-gray-400/10 text-gray-400'
                                                    }`}>
                                                        {m.outcome === "WIN" ? t("profile.win") : m.outcome === "LOSS" ? t("profile.loss") : t("profile.draw_result")}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {matchHistory.length > itemsPerPage && (
                        <div className="flex items-center justify-between border-t border-[#2b2925] pt-4 mt-4">
                            <span className="text-xs text-gray-400 font-medium">
                                {t("stats.page")} <span className="font-mono text-white font-bold">{currentPage}</span> {t("stats.of")} <span className="font-mono text-white font-bold">{totalPages}</span>
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 bg-[#262522] border border-[#2b2925] rounded text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-all font-bold text-xs uppercase select-none"
                                >
                                    ← {t("stats.previous")}
                                </button>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 bg-[#262522] border border-[#2b2925] rounded text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-all font-bold text-xs uppercase select-none"
                                >
                                    {t("stats.next")} →
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}