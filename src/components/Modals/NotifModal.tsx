'use client'

import { useState, useEffect } from "react";
import NotifPopup from "@/src/components/ui/NotifPopup";
import useNotifModal from "@/src/hooks/useNotifModal";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";

interface PendingUser {
    id: string;
    username: string;
    club: string;
    elo: number;
}

const NotifModal = () => {
    const notifModal = useNotifModal();
    const [pendingRequests, setPendingRequests] = useState<PendingUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!notifModal.isOpen) return;

        const fetchNotifications = async () => {
            setIsLoading(true);
            try {
                const res = await fetch("/api/friends/pending");
                if (res.ok) {
                    const data = await res.json();
                    setPendingRequests(data);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des notifications :", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, [notifModal.isOpen]);

    const handleAction = async (requesterId: string, action: "accept" | "refuse") => {
        try {
            const res = await fetch("/api/friends/action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requesterId, action })
            });

            if (res.ok) {
                // Supprime localement la notification de la liste une fois traitée
                setPendingRequests((prev) => prev.filter((user) => user.id !== requesterId));
            }
        } catch (error) {
            console.error("Erreur lors du traitement de l'action :", error);
        }
    };

    const bodyContent = (
        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
            {isLoading && (
                <p className="text-sm text-gray-500 text-center py-4 animate-pulse">
                    Chargement des notifications...
                </p>
            )}

            {!isLoading && pendingRequests.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-6 font-medium">
                    Aucune nouvelle notification.
                </p>
            )}

            {!isLoading && pendingRequests.map((user) => (
                <div 
                    key={user.id} 
                    className="flex items-center justify-between p-3.5 bg-[#211f1b] border border-[#2b2925] rounded-lg group hover:border-[#45423f] transition-all duration-150"
                >
                    {/* Infos du joueur demandeur */}
                    <div className="flex flex-col min-w-0">
                        <span className="text-white font-bold tracking-wide text-sm truncate">
                            {user.username}
                        </span>
                        <span className="text-[11px] text-gray-400 mt-0.5 font-semibold uppercase tracking-wider">
                            Souhaite vous ajouter en ami
                        </span>
                    </div>

                    {/* Boutons d'actions rapides */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => handleAction(user.id, "accept")}
                            title="Accepter"
                            className="flex items-center justify-center w-8 h-8 rounded bg-[#81b64c] hover:bg-[#92cb57] text-white transition-all duration-150 active:scale-90 shadow-md shadow-[#81b64c]/10"
                        >
                            <AiOutlineCheck size={16} />
                        </button>
                        <button
                            onClick={() => handleAction(user.id, "refuse")}
                            title="Refuser"
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
                title="Notifications"
                onClose={notifModal.onClose}
                body={bodyContent}
            />
        </div>
    );
};

export default NotifModal;