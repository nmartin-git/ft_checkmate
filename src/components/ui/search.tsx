'use client'

import { useState, useEffect } from "react";
import { AiOutlineSearch, AiOutlineUserAdd } from "react-icons/ai";

interface SearchedUser {
    id: string;
    username: string;
}

export default function SearchBar() {
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
                    setResults(data);
                }
            } catch (error) {
                console.error("Erreur lors de la recherche :", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSendRequest = async (targetUserId: string) => {
        try {
            const res = await fetch("/api/friends/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ friendId: targetUserId })
            });
            if (res.ok) {
                alert("Demande d'ami envoyée !");
                setResults((prev) => prev.filter((u) => u.id !== targetUserId));
            }
        } catch (error) {
            console.error("Impossible d'ajouter cet ami :", error);
        }
    };

    return (
        <div className="w-full relative flex flex-col gap-2">
            <div className="relative w-full">
                <input
                    type="text"
                    placeholder="Rechercher un joueur par son pseudo..."
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
                <div className="absolute top-[64px] z-10 w-full bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg shadow-2xl overflow-hidden flex flex-col divide-y divide-[#2b2925]">
                    {results.map((user) => (
                        <div 
                            key={user.id} 
                            className="flex items-center justify-between p-4 hover:bg-[#262522] transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#2b2925] flex items-center justify-center text-white font-bold uppercase text-sm border border-[#45423f]">
                                    {user.username.substring(0, 2)}
                                </div>
                                <span className="text-white font-semibold tracking-wide">
                                    {user.username}
                                </span>
                            </div>
                            
                            <button
                                onClick={() => handleSendRequest(user.id)}
                                className="flex items-center gap-2 bg-[#81b64c] hover:bg-[#92cb57] text-white px-4 py-2 text-xs font-black uppercase tracking-wider rounded transition-all duration-150 active:scale-95 shadow-md shadow-[#81b64c]/10"
                            >
                                <AiOutlineUserAdd size={16} />
                                Ajouter
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