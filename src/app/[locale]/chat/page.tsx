"use client";

import { useEffect, useMemo, useState } from "react";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getTranslations } from "next-intl/server";

type PublicUser = {
  id: string;
  username: string;
  avatar?: string | null;
};

type DirectMessage = {
  id: string;
  message: string;
  date: string;
  read_at: string | null;
  sender_id: string;
  receiver_id: string;
};

type ConversationItem = {
  partner: PublicUser;
  lastMessage: DirectMessage;
  unreadCount: number;
};

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'secret-a-changer'
);

interface TokenPayload {
    id: string;
    username: string;
    email: string;
}

export default async function ChatPage() {
	const [currentUserId, setCurrentUserId] = useState("");

	const [conversations, setConversations] = useState<ConversationItem[]>([]);
	const [selectedPartner, setSelectedPartner] = useState<PublicUser | null>(null);
	const [messages, setMessages] = useState<DirectMessage[]>([]);
	const [newMessage, setNewMessage] = useState("");

	const [isLoadingConversations, setIsLoadingConversations] = useState(false);
	const [isLoadingMessages, setIsLoadingMessages] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const [error, setError] = useState("");

	const canUseChat = useMemo(() => currentUserId.trim().length > 0, [currentUserId]);

	const t = await getTranslations("errors");
	const cookieStore = await cookies();
	const token = cookieStore.get('auth-token')?.value;
  
	if (!token) {
		return <p className="text-white text-center mt-10">{t("not_connected")}</p>;
	}
	const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET);
	if (!payload || !payload.id) {
		return <p className="text-white text-center mt-10">{t("invalid_session")}</p>;
	}

	useEffect(() => {
	  if (!canUseChat) return;
	  loadConversations();
	}, [canUseChat]);

	useEffect(() => {
	  if (!canUseChat || !selectedPartner) return;
	  loadConversationMessages(selectedPartner.id);
	}, [canUseChat, selectedPartner?.id]);

	async function loadConversations() {
	  try {
	    setIsLoadingConversations(true);
	    setError("");

	    const res = await fetch("/api/chat/conversations", { method: "GET" });
	    const data = await res.json();
	    if (!res.ok) throw new Error(data?.error || "Failed to load conversations");

	    setConversations(data.conversations || []);

	    // ===== CÔTÉ route.ts =====
	    // GET /api/chat/conversations
	    // -> appeler listConversations(currentUserId)
	    // -> return { conversations }
	  } catch (e: any) {
	    setError(e.message || "Unknown error");
	  } finally {
	    setIsLoadingConversations(false);
	  }
	}

	async function loadConversationMessages(otherId: string) {
	  try {
	    setIsLoadingMessages(true);
	    setError("");

	    const res = await fetch(`/api/chat/messages?otherId=${encodeURIComponent(otherId)}`, {
	      method: "GET",
	    });
	    const data = await res.json();
	    if (!res.ok) throw new Error(data?.error || "Failed to load messages");

	    setMessages(data.messages || []);

	    // ===== CÔTÉ route.ts =====
	    // GET /api/chat/messages?otherId=...
	    // -> appeler getConversation(currentUserId, otherId)
	    // -> puis markConversationRead(currentUserId, otherId)
	    // -> return { messages }
	    //
	    // (Optionnel) recharger conversations pour rafraîchir unreadCount
	    loadConversations();
	  } catch (e: any) {
	    setError(e.message || "Unknown error");
	  } finally {
	    setIsLoadingMessages(false);
	  }
	}

	async function onSendMessage(e: React.FormEvent) {
	  e.preventDefault();
	  if (!selectedPartner) return;
	  if (!newMessage.trim()) return;

	  try {
	    setIsSending(true);
	    setError("");

	    const res = await fetch("/api/chat/messages", {
	      method: "POST",
	      headers: { "Content-Type": "application/json" },
	      body: JSON.stringify({
	        receiverId: selectedPartner.id,
	        message: newMessage,
	      }),
	    });
	    const data = await res.json();
	    if (!res.ok) throw new Error(data?.error || "Failed to send message");

	    setNewMessage("");

	    // ===== CÔTÉ route.ts =====
	    // POST /api/chat/messages
	    // body: { receiverId, message }
	    // -> appeler sendDirectMessage(currentUserId, receiverId, message)
	    // -> return { message: createdMessage }

	    await loadConversationMessages(selectedPartner.id);
	    await loadConversations();
	  } catch (e: any) {
	    setError(e.message || "Unknown error");
	  } finally {
	    setIsSending(false);
	  }
	}

	return (
    <main className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Direct Messages</h1>

      {/* Temporaire: à remplacer par ta session */}
      <input
        className="border rounded px-3 py-2 mb-4 w-full"
        placeholder="Current user id (UUID)"
        value={currentUserId}
        onChange={(e) => setCurrentUserId(e.target.value)}
      />

      {!canUseChat ? (
        <p className="text-gray-500">Renseigne ton userId pour charger le chat.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
          {/* Sidebar conversations */}
          <aside className="border rounded p-2 h-[70vh] overflow-y-auto">
            <h2 className="font-semibold mb-2">Conversations</h2>

            {isLoadingConversations ? (
              <p>Chargement...</p>
            ) : conversations.length === 0 ? (
              <p className="text-gray-500">Aucune conversation</p>
            ) : (
              <ul className="space-y-2">
                {conversations.map((c) => (
                  <li key={c.partner.id}>
                    <button
                      onClick={() => setSelectedPartner(c.partner)}
                      className={`w-full text-left p-2 rounded border ${
                        selectedPartner?.id === c.partner.id ? "bg-gray-100" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{c.partner.username}</span>
                        {c.unreadCount > 0 && (
                          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{c.lastMessage.message}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* Messages panel */}
          <section className="border rounded p-3 h-[70vh] flex flex-col">
            {!selectedPartner ? (
              <p className="text-gray-500">Sélectionne une conversation</p>
            ) : (
              <>
                <div className="border-b pb-2 mb-2">
                  <h3 className="font-semibold">{selectedPartner.username}</h3>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                  {isLoadingMessages ? (
                    <p>Chargement des messages...</p>
                  ) : messages.length === 0 ? (
                    <p className="text-gray-500">Pas encore de messages.</p>
                  ) : (
                    messages.map((m) => {
                      const mine = m.sender_id === currentUserId;
                      return (
                        <div
                          key={m.id}
                          className={`max-w-[75%] p-2 rounded ${
                            mine
                              ? "ml-auto bg-blue-600 text-white"
                              : "mr-auto bg-gray-200 text-gray-900"
                          }`}
                        >
                          <p>{m.message}</p>
                          <p className="text-[11px] opacity-70 mt-1">
                            {new Date(m.date).toLocaleString()}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={onSendMessage} className="flex gap-2">
                  <input
                    className="flex-1 border rounded px-3 py-2"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrire un message..."
                    maxLength={140}
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
                  >
                    {isSending ? "Envoi..." : "Envoyer"}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}

      {error && <p className="text-red-600 mt-3">{error}</p>}
    </main>
  );
}
