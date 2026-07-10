'use client'

import { useState, useEffect } from "react";
import { AiOutlineSearch, AiOutlineUserAdd, AiOutlineUserDelete } from "react-icons/ai";
import Link from "next/link";
import { useLocale, useTranslations} from "next-intl";

interface SearchedUser {
    id: string;
    username: string;
    isPending?: boolean;
}

export default function SearchBar() {
    const t = useTranslations("social");
    const locale = useLocale();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchedUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim() === "") {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data.map((u: SearchedUser) => ({ ...u, isPending: u.isPending || false })));
                }
            } catch (error) {
                console.error("Erreur lors de la recherche :", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleToggleRequest = async (targetUserId: string) => {
        setResults((prev) =>
            prev.map((u) => (u.id === targetUserId ? { ...u, isPending: !u.isPending } : u))
        );

        try {
            const res = await fetch("/api/friends/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ friendId: targetUserId })
            });

            if (!res.ok) {
                setResults((prev) =>
                    prev.map((u) => (u.id === targetUserId ? { ...u, isPending: !u.isPending } : u))
                );
            }
        } catch (error) {
            console.error("Erreur lors de l'action d'amitié :", error);
            setResults((prev) =>
                prev.map((u) => (u.id === targetUserId ? { ...u, isPending: !u.isPending } : u))
            );
        }
    };

    return (
        <div className="w-full relative flex flex-col gap-2">
            <div className="relative w-full">
                <input
                    type="text"
                    placeholder={t("search_placeholder")}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full p-4 pl-12 bg-[#211f1b] border-2 border-[#2b2925] rounded-lg text-white font-medium placeholder-gray-500 outline-none focus:border-[#45423f] transition-all duration-200"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <AiOutlineSearch size={22} />
                </div>
                {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 animate-pulse">
                        Recherche...
                    </div>
                )}
            </div>

            {results.length > 0 && (
                <div className="absolute top-[64px] z-30 w-full bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg shadow-2xl overflow-hidden flex flex-col">
                    {results.map((user) => (
                        <div 
                            key={user.id}
                            className="flex items-center justify-between p-2.5 mx-1 my-0.5 rounded-md hover:bg-[#262522] transition-colors group"
                        >
                            <Link 
                                href={`/${locale}/profile/${user.id}`}
                                className="flex items-center gap-3 flex-grow cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#2b2925] flex items-center justify-center text-white font-bold uppercase text-xs border border-[#45423f]">
                                    {user.username.substring(0, 2)}
                                </div>
                                <span className="text-white font-semibold tracking-wide text-sm hover:text-[#81b64c] transition-colors">
                                    {user.username}
                                </span>
                            </Link>
                            
                            <button
                                onClick={() => handleToggleRequest(user.id)}
                                className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider rounded transition-all duration-150 active:scale-95 shadow-md ${
                                    user.isPending 
                                        ? "bg-[#312e2b] text-gray-400 border border-[#45423f] hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50" 
                                        : "bg-[#81b64c] hover:bg-[#92cb57] text-white shadow-[#81b64c]/10"
                                    }`}
                            >
                                {user.isPending ? (
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
                        </div>
                    ))}
                </div>
            )}

            {query.trim() !== "" && !isLoading && results.length === 0 && (
                <p className="text-xs text-gray-500 mt-1 pl-1">
                    Aucun joueur trouvé pour "{query}".
                </p>
            )}
        </div>
    );
}