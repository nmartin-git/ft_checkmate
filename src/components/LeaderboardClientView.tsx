'use client'

import { club_names } from "@prisma/client";
import Avatar from "@/src/components/ui/Avatar"
import Link from "next/link";
import { useLocale, useTranslations} from "next-intl";

interface PlayerRow {
    id: string;
    username: string | null;
    club: club_names;
    elo: number;
    avatar_url?: string | null;
}

interface LeaderboardClientViewProps {
    leaderboard: PlayerRow[];
}

const CLUB_TEXT_COLORS: Record<club_names, string> = {
    [club_names.Alliance]: "text-[#33b4e5]",
    [club_names.Assembly]: "text-[#a251b6]",
    [club_names.Federation]: "text-[#e24c3c]",
    [club_names.Order]: "text-[#ffc107]"
};

export default function LeaderboardClientView({ leaderboard }: LeaderboardClientViewProps) {
    const t = useTranslations("social");
    const locale = useLocale();
	
	return (
 		<div className="min-h-[calc(100vh-100px)] bg-[#262522] text-white p-6 select-none">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black mb-6 uppercase tracking-tight">🏆 {t("leaderboard")}</h1>
                
                <div className="bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg overflow-hidden shadow-xl">
                    {leaderboard.map((player, index) => {
                        const textColor = CLUB_TEXT_COLORS[player.club] || "text-gray-400";
                        
                        return (
                            <Link 
                                key={player.id} 
                                href={`/${locale}/profile/${player.id}`}
                                className="flex items-center justify-between p-4 border-b border-[#2b2925] last:border-0 hover:bg-[#211f1b] hover:border-l-4 hover:border-l-[#81b64c] transition-all duration-150 cursor-pointer block"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="font-mono font-black text-gray-500 w-6 text-center">
                                        #{index + 1}
                                    </span>
                                    <span className="font-bold text-white hover:text-[#81b64c] transition-colors">
                                        <><Avatar src={player.avatar_url} username={player.username} size={32} className="mr-2 inline-block align-middle" />{player.username}</>
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded uppercase font-black bg-[#312e2b] ${textColor}`}>
                                        {player.club}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-black text-[#81b64c]">{player.elo} ELO</span>
                                    <span className="text-gray-600 text-sm font-bold pl-2 group-hover:text-white">→</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}