'use client'

import Button from "@/src/components/ui/Button"
import { useRouter } from "next/navigation"
import useCurrentUser from "@/src/hooks/useCurrentUser"
import { club_names } from "@prisma/client"
import Link from "next/link"
import { useLocale } from "next-intl"
import { useEffect, useState } from "react"
import { AiOutlineUserAdd, AiOutlineUserDelete } from "react-icons/ai"

interface ProfileClientViewProps {
    userData: {
        id: string;
        username: string | null;
        email: string | null;
        club: club_names;
        elo: number;
        isInitialPending?: boolean;
    };
    rank: number;
    friendsCount: number;
    isPublicView?: boolean;
}

const CLUB_STYLES: Record<club_names, { badge: string; avatarBorder: string; text: string }> = {
    [club_names.Alliance]: { badge: "bg-[#33b4e5] text-white", avatarBorder: "border-[#33b4e5]", text: "text-[#33b4e5]" },
    [club_names.Assembly]: { badge: "bg-[#a251b6] text-white", avatarBorder: "border-[#a251b6]", text: "text-[#a251b6]" },
    [club_names.Federation]: { badge: "bg-[#e24c3c] text-white", avatarBorder: "border-[#e24c3c]", text: "text-[#e24c3c]" },
    [club_names.Order]: { badge: "bg-[#ffc107] text-black", avatarBorder: "border-[#ffc107]", text: "text-[#ffc107]" }
};

export default function ProfileClientView({ userData, rank, isPublicView, friendsCount }: ProfileClientViewProps) {
    const router = useRouter();
    const locale = useLocale();
    const { user } = useCurrentUser();
    
    const [isPending, setIsPending] = useState(userData.isInitialPending || false);

    const handleEditClick = () => {
        router.push(`/${locale}/profile/parameters`);
    };

    useEffect(() => {
        if (userData.isInitialPending !== undefined) {
            setIsPending(userData.isInitialPending);
        }
    }, [userData.isInitialPending]);

    useEffect(() => {
        if (!user && !isPublicView) {
            router.push(`/${locale}/`);
        }
    }, [user, isPublicView, router, locale]);

    if (!user && !isPublicView) return null;

    const currentUserId = user?.id || user?.id;
    const isOwnProfile = currentUserId === userData.id;

    const handleToggleFriendRequest = async () => {
        if (isOwnProfile) return;

        setIsPending((prev) => !prev);

        try {
            const res = await fetch("/api/friends/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ friendId: userData.id })
            });

            if (!res.ok) {
                setIsPending((prev) => !prev);
            }
        } catch (error) {
            console.error("Erreur lors de l'action d'amitié sur le profil :", error);
            setIsPending((prev) => !prev);
        }
    };

    const currentStyle = CLUB_STYLES[userData.club] || {
        badge: "bg-[#81b64c] text-white",
        avatarBorder: "border-[#45423f]",
        text: "text-[#81b64c]"
    };

    return (
        <div className="min-h-[calc(100vh-100px)] bg-[#262522] text-white p-6 md:p-10 select-none">
            <div className="max-w-6xl mx-auto bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left w-full">
                    <div className="w-24 h-24 bg-[#312e2b] border-2 border-[#45423f] rounded-md flex items-center justify-center text-[#81b64c] text-4xl font-black uppercase shadow-inner">
                        {userData.username?.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="space-y-1">
                        <div className="flex items-center justify-center sm:justify-start gap-3">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                                {userData.username}
                            </h1>
                            <span className={`${currentStyle.badge} text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider transition-colors duration-300`}>
                                {userData.club}
                            </span>
                        </div>
                        <p className="text-gray-400 font-medium text-sm md:text-base">{userData.email}</p>
                    </div>
                </div>

                <div className="w-full md:w-auto flex justify-center md:justify-end">
                    {!isPublicView ? (
                        <Button
                            label="Parameters"
                            secondary
                            onClick={handleEditClick}
                        />
                    ) : (
                        // Le bouton s'affiche si ce n'est pas ton propre profil
                        !isOwnProfile && (
                            <button
                                onClick={handleToggleFriendRequest}
                                className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded transition-all duration-150 active:scale-95 shadow-md ${
                                    isPending 
                                        ? "bg-[#312e2b] text-gray-400 border border-[#45423f] hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50" 
                                        : "bg-[#81b64c] hover:bg-[#92cb57] text-white shadow-[#81b64c]/10"
                                }`}
                            >
                                {isPending ? (
                                    <>
                                        <AiOutlineUserDelete size={16} />
                                        En attente
                                    </>
                                ) : (
                                    <>
                                        <AiOutlineUserAdd size={16} />
                                        Ajouter
                                    </>
                                )}
                            </button>
                        )
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg p-6 shadow-xl flex flex-col justify-between min-h-64">
                    <div>
                        <p className="text-gray-300 font-black uppercase tracking-wider text-sm mb-4">📜 Matchs historics</p>
                        <p className="text-sm text-gray-500 font-medium mt-6">No matchs played yet</p>
                    </div>
                </div>   

                <Link href={`/${locale}/leaderboard`} className="bg-[#1e1c18] border-2 border-[#2b2925] hover:border-blue-500/40 rounded-lg p-6 shadow-xl flex flex-col justify-between min-h-64 transition-all duration-200 group cursor-pointer">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-gray-300 font-black uppercase tracking-wider text-sm">🏆 Elo & historics</p>
                            <span className="text-xs text-blue-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Classement →</span>
                        </div>
                        <div className="flex items-baseline gap-2 mt-6">
                            <span className="text-5xl font-black text-white tracking-tight">{userData.elo}</span> 
                            <span className="text-[#81b64c] font-black text-lg uppercase">elo</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[#2b2925]">
                            <span className="text-sm text-gray-400">Classement mondial : </span>
                            <span className="font-mono font-black text-blue-400 tracking-wide group-hover:scale-105 inline-block transition-transform">#{rank}</span>
                        </div>
                    </div>
                </Link>

                <Link href={`/${locale}/friends`} className="bg-[#1e1c18] border-2 border-[#2b2925] hover:border-blue-500/40 rounded-lg p-6 shadow-xl flex flex-col justify-between min-h-64 transition-all duration-200 group cursor-pointer">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-gray-300 font-black uppercase tracking-wider text-sm">👥 Friend(s)</p>
                            <span className="text-xs text-blue-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Liste d'amis →</span>
                        </div>
                        <div className="flex items-baseline gap-2 mt-6">
                            <span className="text-5xl font-black text-white tracking-tight">{friendsCount}</span> 
                            <span className="text-[#81b64c] font-black text-lg uppercase">friends</span>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}