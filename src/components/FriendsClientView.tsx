'use client'

import { club_names } from "@prisma/client";
import Avatar from "@/src/components/ui/Avatar";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import SearchBar from "./ui/search";
import { useState } from "react";
import { AiOutlineClose, AiOutlineMessage } from "react-icons/ai";
import { useRouter } from "next/navigation";

interface PlayerRow {
    id: string;
    username: string | null;
    club: club_names;
    elo: number;
    avatar_url?: string | null;
    is_online : boolean;
}

interface FriendsClientViewProps {
    friendsList: PlayerRow[];
}

const CLUB_TEXT_COLORS: Record<club_names, string> = {
    [club_names.Alliance]: "text-[#33b4e5]",
    [club_names.Assembly]: "text-[#a251b6]",
    [club_names.Federation]: "text-[#e24c3c]",
    [club_names.Order]: "text-[#ffc107]"
};

export default function FriendsClientView({ friendsList }: FriendsClientViewProps) {
    const t = useTranslations("social");
    const locale = useLocale();
    const router = useRouter();
    const [list, setList] = useState<PlayerRow[]>(friendsList);

    const handleRemove = async (e: React.MouseEvent, friendId: string) => {
        e.preventDefault();

        try {
            const res = await fetch(`/api/friends/remove?friendId=${friendId}`, {
                method: "DELETE"
            });

            if (res.ok) {
                setList((prev) => prev.filter((player) => player.id !== friendId));
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de l'ami :", error);
        }
    };
    
    return (
        <div className="min-h-[calc(100vh-100px)] bg-[#262522] text-white p-6 select-none">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black mb-6 uppercase tracking-tight">👥 {t("friends_list")}</h1>
                <SearchBar/>
                
                <div className="bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg overflow-hidden shadow-xl">
                    {list.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">{t("no_friends")}</p>
                    ) : (
                        list.map((player, index) => {
                            const textColor = CLUB_TEXT_COLORS[player.club] || "text-gray-400";
                            
                            return (
                                <Link 
                                    key={player.id} 
                                    href={`/${locale}/profile/${player.id}`}
                                    className="flex items-center justify-between p-4 border-b border-[#2b2925] last:border-0 hover:bg-[#211f1b] hover:border-l-4 hover:border-l-[#81b64c] transition-all duration-150 cursor-pointer block group"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono font-black text-gray-500 w-6 text-center">
                                            #{index + 1}
                                        </span>
                                        <Avatar src={player.avatar_url} username={player.username} size={36} />
                                        <span className="font-bold text-white hover:text-[#81b64c] transition-colors">
                                            {player.username}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded uppercase font-black bg-[#312e2b] ${textColor}`}>
                                            {player.club}
                                        </span>
                                        <span className={player.is_online ? "text-green-500" : "text-red-500"}>
                                            {player.is_online ? "En ligne" : "Hors ligne"}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono font-black text-[#81b64c]">{player.elo} ELO</span>
                                        
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                router.push(`/${locale}/profile/${player.id}/message`);
                                            }}
                                            className="text-gray-400 hover:text-[#81b64c] p-1.5 rounded bg-[#262522] border border-[#312e2b] hover:border-[#81b64c] transition-all duration-150 active:scale-90"
                                            title="Discuter"
                                        >
                                            <AiOutlineMessage size={18} />
                                        </button>

                                        <button
                                            onClick={(e) => handleRemove(e, player.id)}
                                            className="text-gray-500 hover:text-red-500 p-1 rounded transition-colors duration-150 active:scale-90"
                                            title={t("remove_friend")}
                                        >
                                            <AiOutlineClose size={18} className="stroke-[2px]" />
                                        </button>
                                    </div> 
                                </Link>
                            );
                        })
                    )}
                </div> 
            </div> 
        </div> 
    );
}