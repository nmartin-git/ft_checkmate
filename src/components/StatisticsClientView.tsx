'use client'

import { useRouter, usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import EloChart from "./EloChart";
import WinRateChart from "./WinRateChart";


const BADGE_CONFIGS = {
    wins: {
        title: "Prédateur",
        icon: "⚔️",
        steps: [3, 10, 50],
        color: "from-amber-500 to-orange-600"
    },
    losses: {
        title: "Survivant",
        icon: "🛡️",
        steps: [3, 10, 50],
        color: "from-red-600 to-rose-800"
    },
    total: {
        title: "Vétéran",
        icon: "👑",
        steps: [5, 15, 100],
        color: "from-blue-500 to-indigo-700"
    }
};

const getBadgeStepDetails = (currentCount: number, steps: number[]) => {
    let activeStepIndex = -1;
    for (let i = 0; i < steps.length; i++) {
        if (currentCount >= steps[i]) {
            activeStepIndex = i;
        }
    }
    const nextStep = activeStepIndex < steps.length - 1 ? steps[activeStepIndex + 1] : null;
    return {
        level: activeStepIndex + 1, // Niveau 0 à 3
        isAcquired: activeStepIndex >= 0,
        currentStepValue: activeStepIndex >= 0 ? steps[activeStepIndex] : 0,
        nextStepValue: nextStep
    };
};

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

    const totalPlayed = stats.wins + stats.losses + stats.draws;

    const badges = [
        {
            ...BADGE_CONFIGS.wins,
            count: stats.wins,
            status: getBadgeStepDetails(stats.wins, BADGE_CONFIGS.wins.steps)
        },
        {
            ...BADGE_CONFIGS.losses,
            count: stats.losses,
            status: getBadgeStepDetails(stats.losses, BADGE_CONFIGS.losses.steps)
        },
        {
            ...BADGE_CONFIGS.total,
            count: totalPlayed,
            status: getBadgeStepDetails(totalPlayed, BADGE_CONFIGS.total.steps)
        }
    ];

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

                {/* 🏆 Bloc des Badges Évolutifs */}
                <div className="bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg p-6 shadow-xl">
                    <p className="text-gray-300 font-black uppercase tracking-wider text-sm mb-4">🏅 Insignes de Carrière</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {badges.map((badge, idx) => {
                            const { isAcquired, level, nextStepValue } = badge.status;
                            return (
                                <div 
                                    key={idx} 
                                    className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#262522] border border-[#2b2925] relative overflow-hidden"
                                >
                                    {/* Effet lumineux en arrière-plan si acquis */}
                                    {isAcquired && (
                                        <div className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-5`} />
                                    )}
                                    
                                    {/* Icône du badge */}
                                    <span className={`text-4xl mb-2 transition-all duration-300 ${
                                        isAcquired ? "scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]" : "grayscale opacity-25"
                                    }`}>
                                        {badge.icon}
                                    </span>

                                    {/* Titre */}
                                    <span className={`text-xs font-black uppercase tracking-wider ${
                                        isAcquired ? "text-white" : "text-gray-600"
                                    }`}>
                                        {badge.title}
                                    </span>

                                    {/* Niveau d'étoiles */}
                                    <div className="flex gap-1 my-1.5">
                                        {[1, 2, 3].map((star) => (
                                            <span 
                                                key={star} 
                                                className={`text-[10px] ${
                                                    star <= level ? "text-yellow-500 drop-shadow-[0_0_2px_rgba(234,179,8,0.5)]" : "text-gray-800"
                                                }`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>

                                    {/* Progression Numérique */}
                                    <span className="text-xs font-mono text-gray-500">
                                        {badge.count}
                                        {nextStepValue ? ` / ${nextStepValue}` : " (Max)"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
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