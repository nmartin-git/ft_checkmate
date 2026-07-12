'use client'

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    message: string;
    date: Date | string;
}

interface DiscussionClientViewProps {
    initialMessages: any[];
    currentUserId: string;
    partner: { id: string; username: string | null };
    isChatEnabled: boolean;
}

export default function DiscussionClientView({ initialMessages, currentUserId, partner, isChatEnabled }: DiscussionClientViewProps) {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isChatEnabled) {
            scrollToBottom();
        }
    }, [messages, isChatEnabled]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isChatEnabled || !text.trim() || loading) return;

        setLoading(true);
        setErrorMessage(null);
        
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiverId: partner.id, message: text.trim() })
            });

            const data = await res.json();

            if (res.ok) {
                setMessages((prev) => [...prev, data]);
                setText("");
            } else {
                setErrorMessage(data.error || "Une erreur est survenue.");
            }
        } catch (err) {
            console.error("Erreur réseau lors de l'envoi:", err);
            setErrorMessage("Impossible de contacter le serveur.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-100px)] bg-[#262522] text-white p-4 flex flex-col justify-between select-none">
            <div className="max-w-2xl w-full mx-auto bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg shadow-xl flex flex-col h-[75vh]">
                
                <div className="p-4 border-b border-[#2b2925] bg-[#151412] flex items-center justify-between">
                    <span className="font-black uppercase tracking-wide">💬 {partner.username}</span>
                    <button onClick={() => router.back()} className="text-xs text-gray-400 hover:text-white uppercase font-bold transition-colors">
                        Retour
                    </button>
                </div>

                {!isChatEnabled ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#151412]/50">
                        <span className="text-4xl mb-3">🔒</span>
                        <h3 className="text-lg font-black uppercase text-red-400 tracking-wide">Messagerie Désactivée</h3>
                        <p className="text-sm text-gray-400 max-w-sm mt-2 font-medium">
                            Vous devez activer l'option de messagerie dans les paramètres de votre profil pour pouvoir consulter et envoyer des messages.
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                        {messages.map((msg) => {
                            const isMe = msg.sender_id === currentUserId;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[75%] rounded-lg px-4 py-2 text-sm shadow-sm ${
                                        isMe ? "bg-[#81b64c] text-white font-medium" : "bg-[#312e2b] text-gray-200"
                                    }`}>
                                        <p className="break-words">{msg.message}</p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {errorMessage && (
                    <div className="mx-3 my-1 p-2 bg-red-900/40 border border-red-500/50 rounded text-red-200 text-xs text-center font-medium">
                        ⚠️ {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="p-3 bg-[#151412] border-t border-[#2b2925] flex gap-2">
                    <input
                        type="text"
                        maxLength={140}
                        value={text}
                        disabled={loading || !isChatEnabled}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={isChatEnabled ? "Rédiger un message (140 car. max)..." : "Chat désactivé..."}
                        className="flex-1 bg-[#262522] border border-[#312e2b] focus:border-[#81b64c] focus:outline-none rounded px-3 py-2 text-sm text-white placeholder-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
                    />
                    <button
                        type="submit"
                        disabled={loading || !text.trim() || !isChatEnabled}
                        className="bg-[#81b64c] hover:bg-[#92cb57] disabled:bg-[#2b2925] disabled:text-gray-600 text-white px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all duration-150 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                        Envoyer
                    </button>
                </form>

            </div>
        </div>
    );
}