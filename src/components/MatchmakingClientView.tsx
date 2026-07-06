'use client'

import { club_names } from "@prisma/client";
import Link from "next/link";
import { useLocale } from "next-intl";
import SearchBar from "./ui/search";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRef } from "react";

interface PlayerRow {
    id: string;
    username: string | null;
    club: club_names;
    elo: number;
}

interface FriendsClientViewProps {
    friendsList: PlayerRow[];
}

interface ActiveRequest {
    user_id: string;
    friend_id: string;
}

const CLUB_TEXT_COLORS: Record<club_names, string> = {
    [club_names.Alliance]: "text-[#33b4e5]",
    [club_names.Assembly]: "text-[#a251b6]",
    [club_names.Federation]: "text-[#e24c3c]",
    [club_names.Order]: "text-[#ffc107]"
};

export default function FriendsClientView({ friendsList }: FriendsClientViewProps) {
    const locale = useLocale();
    const router = useRouter();
    const [list] = useState<PlayerRow[]>(friendsList);
    const [activeRequests, setActiveRequests] = useState<ActiveRequest[]>([]);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const challengedFriendIdRef = useRef<string | null>(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const friendId = challengedFriendIdRef.current;      // valeur à jour
                const url = friendId
                    ? `/api/game/online/matchmaking?friendId=${friendId}`
                    : "/api/game/online/matchmaking";

                const res = await fetch(url);
                if (!res.ok) return;

                const data = await res.json();
                setActiveRequests(data.activeRequests);              // ← objet, plus tableau

                if (data.gameId) {                                   // l'ami a accepté !
                    clearInterval(interval);
                    router.push(`/${locale}/game/${data.gameId}`);
                }
            } catch (err) {
                console.error("Erreur de récupération des défis:", err);
            }
        };
        fetchRequests();

        const interval = setInterval(fetchRequests, 3000);
        return () => clearInterval(interval);
    }, []);

    const hasOutboundChallenge = activeRequests.some((req) => req.friend_id !== null && !friendsList.some(f => f.id === req.user_id)); 

    const handleChallengeToggle = async (e: React.MouseEvent, friendId: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isProcessing) return;
        setIsProcessing(friendId);

        const isSentByMe = activeRequests.some(r => r.friend_id === friendId && r.user_id !== friendId);

        try {
            if (isSentByMe) {
                const res = await fetch(`/api/game/online/matchmaking?friendId=${friendId}`, {
                    method: "POST"
                });
                if (res.ok) {
                    challengedFriendIdRef.current = null;        // ← on arrête de chercher une partie
                    setActiveRequests(prev => prev.filter(r => !(r.friend_id === friendId || r.user_id === friendId)));
                }
            } else {
                const res = await fetch(`/api/game/online/matchmaking?friendId=${friendId}`, {
                    method: "POST"
    			});

            if (res.ok) {
                const data = await res.json();
                if (data.status === "LAUNCHED" && data.gameId) {
                    router.push(`/${locale}/game/${data.gameId}`); //TODO rediriger vers lid game propre
                } else {
                    challengedFriendIdRef.current = friendId;
                    setActiveRequests(prev => [...prev, { user_id: "me", friend_id: friendId }]);
                }
            } else {
                const errMsg = await res.text();
                alert(errMsg);
            }
            }
        } catch (error) {
            console.error("Erreur action matchmaking:", error);
        } finally {
            setIsProcessing(null);
        }
    };

    return (
        <div className="min-h-[calc(100vh-100px)] bg-[#262522] text-white p-6 md:p-10 select-none">
            <div className="max-w-4xl mx-auto space-y-6">
                <SearchBar />

                <div className="bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg shadow-xl overflow-hidden flex flex-col p-2">
                    <div className="p-4 border-b border-[#2b2925]">
                        <h2 className="text-xl font-black uppercase tracking-wide text-gray-200">
                            Mes Amis
                        </h2>
                    </div>

                    {list.length === 0 ? (
                        <p className="text-sm text-gray-500 font-medium p-8 text-center">
                            Vous n'avez pas encore d'amis ajoutés.
                        </p>
                    ) : (
                        list.map((player) => {
                            const textColor = CLUB_TEXT_COLORS[player.club] || "text-white";
                            
                            const isSentToHim = activeRequests.some(r => r.friend_id === player.id);
                            const isReceivedFromHim = activeRequests.some(r => r.user_id === player.id);
                            
                            const isAnyOtherRequestActive = activeRequests.some(r => r.friend_id !== player.id && r.friend_id !== "me");

                            let buttonLabel = "Affronter";
                            let buttonStyle = "bg-[#81b64c] hover:bg-[#92cb57] text-white shadow-[#81b64c]/10";

                            if (isSentToHim) {
                                buttonLabel = "En attente...";
                                buttonStyle = "bg-[#312e2b] text-gray-400 border border-[#45423f] hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50";
                            } else if (isReceivedFromHim) {
                                buttonLabel = "Rejoindre !";
                                buttonStyle = "bg-blue-600 hover:bg-blue-500 text-white animate-pulse";
                            } else if (isAnyOtherRequestActive) {
                                buttonStyle = "bg-gray-800 text-gray-600 cursor-not-allowed opacity-40";
                            }

                            return (
                                <Link 
                                    key={player.id}
                                    href={`/${locale}/profile/${player.id}`}
                                    className="flex items-center justify-between p-3 mx-1 my-1 rounded-md bg-[#151412] border border-[#23211e] hover:border-[#383530] transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#2b2925] flex items-center justify-center text-white font-black uppercase text-sm border border-[#45423f]">
                                            {player.username?.substring(0, 2)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white group-hover:text-[#81b64c] transition-colors">
                                                {player.username}
                                            </span>
                                            <span className={`text-[10px] font-black uppercase tracking-wider ${textColor}`}>
                                                {player.club}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-6">
                                        <span className="font-mono font-black text-xs text-gray-400">{player.elo} ELO</span>
                                        
                                        <button
                                            disabled={isAnyOtherRequestActive && !isSentToHim && !isReceivedFromHim}
                                            onClick={(e) => handleChallengeToggle(e, player.id)}
                                            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded transition-all duration-150 active:scale-95 shadow-md ${buttonStyle}`}
                                        >
                                            {buttonLabel}
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