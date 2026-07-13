import { eloHistoric, getRecentMatches } from "@/src/lib/stats";
import { getProfile } from "@/src/lib/user";
import { notFound } from "next/navigation";
import StatsClientView from "@/src/components/StatisticsClientView";

interface StatsPageProps {
    params: Promise<{ id: string; locale: string }>;
    searchParams: Promise<{ range?: string }>;
}

export default async function PlayerStatsPage({ params, searchParams }: StatsPageProps) {
    const { id } = await params;
    const { range } = await searchParams;

    const userProfile = await getProfile(id);
    if (!userProfile) notFound();

    let days = 0; 
    if (range === "7") days = 7;
    else if (range === "30") days = 30;
    else if (range === "90") days = 90;

    const filteredEloHistory = await eloHistoric(id, days);
    
    const allMatches = await getRecentMatches(id, 0);

    return (
        <StatsClientView 
            username={userProfile.username ?? "Joueur"}
            eloHistory={filteredEloHistory}
            matchHistory={allMatches}
            currentRange={range || "all"}
        />
    );
}