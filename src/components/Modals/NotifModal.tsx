'use client'

import { useState, useEffect } from "react";
import Avatar from "@/src/components/ui/Avatar"
import NotifPopup from "@/src/components/ui/NotifPopup";
import useNotifModal from "@/src/hooks/useNotifModal";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

interface PendingUser {
    id: string;
    username: string;
    club: string;
    elo: number;
    avatar_url?: string | null;
}


const NotifModal = () => {
    const notifModal = useNotifModal();
    const [friendPendingRequests, setFriendPendingRequests] = useState<PendingUser[]>([]);
    const [gamePendingRequests, setGamePendingRequests] = useState<PendingUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("notif");

    useEffect(() => {
        if (!notifModal.isOpen) return;

        const fetchNotifications = async () => {
            setIsLoading(true);
            try {
                const res = await fetch("/api/friends/pending");
                if (res.ok) {
                    const data = await res.json();
                    setFriendPendingRequests(data);
                }
                const gameRes = await fetch("/api/game/online/pending");
                if (gameRes.ok) {
                    const data = await gameRes.json();
                    setGamePendingRequests(data);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des notifications :", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, [notifModal.isOpen]);

    const handleGamesAction = async (requesterId : string , action : "accept" | "refuse") => {
        try {
            const res = await fetch("/api/game/action", {
                method : "POST",
                 headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requesterId, action })
            });
            if (res.ok){
                setGamePendingRequests((prev) =>prev.filter((user)=>user.id !== requesterId));
                if (action === "accept")
                    {
                        const data = await res.json();
                        if (data.status === "LAUNCHED" && data.gameId){
                            notifModal.onClose();
                            router.push(`/${locale}/game/${data.gameId}`);
                        }
                    }
            }
        } catch (error) {
             console.error("Erreur lors du traitement de l'action :", error);
        }

    }

    const handleFriendsAction = async (requesterId: string, action: "accept" | "refuse") => {
        try {
            const res = await fetch("/api/friends/action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requesterId, action })
            });

            if (res.ok) {
                setFriendPendingRequests((prev) => prev.filter((user) => user.id !== requesterId));
            }
        } catch (error) {
            console.error("Erreur lors du traitement de l'action :", error);
        }
    };


    const bodyContent = (
        <div className="flex flex-col gap-3 max-h-100 overflow-y-auto pr-1">
            {isLoading && (
                <p className="text-sm text-gray-500 text-center py-4 animate-pulse">
                    {t("loading")}
                </p>
            )}

            {!isLoading && friendPendingRequests.length === 0 && gamePendingRequests.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-6 font-medium">
                    {t("no_new")}
                </p>
            )}

            {!isLoading && friendPendingRequests.map((user) => (
                <div 
                    key={user.id} 
                    className="flex items-center justify-between p-3.5 bg-[#211f1b] border
                     border-[#2b2925] rounded-lg group hover:border-[#45423f] transition-all duration-150"
                >
                    <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={user.avatar_url} username={user.username} size={40} />
                    <div className="flex flex-col min-w-0">
                        <span className="text-white font-bold tracking-wide text-sm truncate">
                            {user.username}
                        </span>
                        <span className="text-[11px] text-gray-400 mt-0.5 font-semibold uppercase tracking-wider">
                            {t("wants_to_add")}
                        </span>
                    </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => handleFriendsAction(user.id, "accept")}
                            title={t("accept")}
                            className="flex items-center justify-center w-8 h-8 rounded bg-[#81b64c] hover:bg-[#92cb57] text-white transition-all duration-150 active:scale-90 shadow-md shadow-[#81b64c]/10"
                        >
                            <AiOutlineCheck size={16} />
                        </button>
                        <button
                            onClick={() => handleFriendsAction(user.id, "refuse")}
                            title={t("refuse")}
                            className="flex items-center justify-center w-8 h-8 rounded bg-[#e24c3c] hover:bg-[#ef5343] text-white transition-all duration-150 active:scale-90 shadow-md shadow-[#e24c3c]/10"
                        >
                            <AiOutlineClose size={16} />
                        </button>
                    </div>
                </div>
            ))}
                {!isLoading && gamePendingRequests.map((user) => (
        <div
            key={user.id}
            className="flex items-center justify-between p-3.5 bg-[#211f1b] border border-[#2b2925] rounded-lg group hover:border-[#45423f] transition-all duration-150"
        >
            <div className="flex flex-col min-w-0">
                <span className="text-white font-bold tracking-wide text-sm truncate">
                    {user.username}
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5 font-semibold uppercase tracking-wider">
                    {t("challenges_you")}
                </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={() => handleGamesAction(user.id, "accept")}
                    title={t("accept_challenge")}
                    className="flex items-center justify-center w-8 h-8 rounded bg-[#81b64c] hover:bg-[#92cb57] text-white transition-all duration-150 active:scale-90 shadow-md shadow-[#81b64c]/10"
                >
                    <AiOutlineCheck size={16} />
                </button>
                <button
                    onClick={() => handleGamesAction(user.id, "refuse")}
                    title={t("refuse_challenge")}
                    className="flex items-center justify-center w-8 h-8 rounded bg-[#e24c3c] hover:bg-[#ef5343] text-white transition-all duration-150 active:scale-90 shadow-md shadow-[#e24c3c]/10"
                >
                    <AiOutlineClose size={16} />
                </button>
            </div>
        </div>
    ))}
        </div>
    );

    return (
        <div>
            <NotifPopup
                disabled={isLoading}
                isOpen={notifModal.isOpen}
                title={t("title")}
                onClose={notifModal.onClose}
                body={bodyContent}
            />
        </div>
    );
};

export default NotifModal;