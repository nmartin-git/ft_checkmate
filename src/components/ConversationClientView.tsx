'use client'

import Link from "next/link";
import { useLocale } from "next-intl";
import Avatar from "@/src/components/ui/Avatar";
import { club_names } from "@prisma/client";

interface ConversationRow {
    partner: {
        id: string;
        username: string | null;
        avatar_url: string | null;
        club: club_names;
        elo: number;
        is_online: boolean;
    } | null;
    lastMessage: {
        id: string;
        message: string;
        date: string | Date;
        read_at: Date | null;
        sender_id: string;
        receiver_id: string;
    } | null;
    unreadCount: number;
}

interface ConversationsClientViewProps {
    conversations: ConversationRow[];
    isChatEnabled: boolean;
}

export default function ConversationsClientView({ conversations, isChatEnabled }: ConversationsClientViewProps) {
    const locale = useLocale();

    return (
        <div className="min-h-[calc(100vh-100px)] bg-[#262522] text-white p-6 select-none">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-black mb-6 uppercase tracking-tight">💬 Mes Discussions</h1>

                {!isChatEnabled ? (
                    <div className="bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg p-12 text-center shadow-xl flex flex-col items-center justify-center">
                        <span className="text-5xl mb-4">🔒</span>
                        <h2 className="text-xl font-black uppercase text-red-400 tracking-wide">Accès Bloqué</h2>
                        <p className="text-sm text-gray-400 max-w-sm mt-2 font-medium">
                            Votre messagerie privée est actuellement désactivée. Allez dans vos paramètres de profil pour l'activer et accéder à vos conversations.
                        </p>
                    </div>
                ) : (
                    <div className="bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg overflow-hidden shadow-xl">
                        {conversations.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-12 font-medium">Aucune discussion en cours.</p>
                        ) : (
                            conversations.map((conv) => {
                                if (!conv.partner || !conv.lastMessage) return null;

                                return (
                                    <Link
                                        key={conv.partner.id}
                                        href={`/${locale}/profile/${conv.partner.id}/message`}
                                        className="flex items-center justify-between p-4 border-b border-[#2b2925] last:border-0 hover:bg-[#211f1b] hover:border-l-4 hover:border-l-[#81b64c] transition-all duration-150 block group"
                                    >
                                        <div className="flex items-center gap-4 min-w-0 flex-1">
                                            <Avatar src={conv.partner.avatar_url} username={conv.partner.username} size={42} />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-white group-hover:text-[#81b64c] transition-colors truncate">
                                                        {conv.partner.username}
                                                    </p>
                                                    <span className="text-[10px] px-1.5 py-0.2 bg-[#262522] text-gray-400 font-mono rounded">
                                                        {conv.partner.elo} ELO
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 truncate mt-0.5 font-medium">
                                                    {conv.lastMessage.message}
                                                </p>
                                            </div>
                                        </div>

                                        {conv.unreadCount > 0 && (
                                            <span className="bg-[#81b64c] text-white font-mono font-black text-xs min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center shadow">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}