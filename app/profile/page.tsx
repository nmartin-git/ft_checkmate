'use client'

import Button from "@/src/components/ui/Button"
import { useRouter } from "next/navigation"
import useCurrentUser from "@/src/hooks/useCurrentUser" // On importe ton hook !
import useLoginModal from "@/src/hooks/useLoginModal"    // Pour pouvoir ouvrir le login si besoin
import useCurrentUser from "@/src/hooks/useCurrentUser" // On importe ton hook !
import useLoginModal from "@/src/hooks/useLoginModal"    // Pour pouvoir ouvrir le login si besoin

export default function ProfilePage() 
export default function ProfilePage() 
{
    const router = useRouter();
    // const { user } = useCurrentUser(); // On récupère l'utilisateur connecté
    const loginModal = useLoginModal();
    const user = {
        id:99,
        username: "admintest",
        email : "mailtest@mail.com"
    }
    const handleEditClick = () => {
        router.push('/profile/parameters');
    };

    // Sécurité : Si l'utilisateur n'est pas connecté
    // if (!user) {
    //     return (
    //         <div className="flex flex-col items-center justify-center w-screen h-96 gap-4">
    //             <p className="text-xl text-white">Vous devez être connecté pour voir votre profil.</p>
    //             <Button 
    //                 label="Se connecter" 
    //                 onClick={() => loginModal.onOpen()} 
    //             />
    //         </div>
    //     );
    // }

    return (    
        <div className="min-h-[calc(100vh-100px)] bg-[#262522] text-white p-6 md:p-10 select-none">
            
            {/* Header Profil Réel - Style Fiche Joueur Chess.com */}
            <div className="max-w-6xl mx-auto bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left w-full">
                    {/* Avatar carré avec léger arrondi typique de Chess.com */}
                    <div className="w-24 h-24 bg-[#312e2b] border-2 border-[#45423f] rounded-md flex items-center justify-center text-[#81b64c] text-4xl font-black uppercase shadow-inner">
                        {user.username?.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="space-y-1">
                        <div className="flex items-center justify-center sm:justify-start gap-3">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                                {user.username}
                            </h1>
                            <span className="bg-[#81b64c] text-white text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                Player
                            </span>
                        </div>
                        <p className="text-gray-400 font-medium text-sm md:text-base">{user.email}</p>
                    </div>
                </div>
                
                {/* Bouton paramètres utilisant ton style secondaire gris foncé */}
                <div className="w-full md:w-auto flex justify-center md:justify-end">
                    <Button
                        label="Parameters"
                        secondary
                        onClick={handleEditClick}
                    />
                </div>
            </div>

            {/* Statistiques et Historique (Layout Grille épurée) */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Historique des matchs */}
                <div className="bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg p-6 shadow-xl flex flex-col justify-between min-h-64">
                    <div>
                        <p className="text-gray-300 font-black uppercase tracking-wider text-sm mb-4">
                            📜 Matchs historics
                        </p>
                        {/* Plus tard, tu feras un .map() sur tes matchs stockés en BDD */}
                        <p className="text-sm text-gray-500 font-medium mt-6">No matchs played yet</p>
                    </div>
                </div>   

                {/* Classement / ELO */}
                <div className="bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg p-6 shadow-xl flex flex-col justify-between min-h-64">
                    <div>
                        <p className="text-gray-300 font-black uppercase tracking-wider text-sm mb-4">
                            🏆 Elo & historics
                        </p>
                        <div className="flex items-baseline gap-2 mt-6">
                            <span className="text-5xl font-black text-white tracking-tight">1000</span> 
                            <span className="text-[#81b64c] font-black text-lg uppercase">LP</span>
                        </div>
                    </div>
                </div>

                {/* Liste d'Amis */}
                <div className="bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg p-6 shadow-xl flex flex-col justify-between min-h-64">
                    <div>
                        <p className="text-gray-300 font-black uppercase tracking-wider text-sm mb-4">
                            👥 Friend(s)
                        </p>
                        <p className="text-sm text-gray-500 font-medium mt-6">You doesn't have friends yet.</p>
                    </div>
                </div>
                
            </div>
        </div>
    )
}