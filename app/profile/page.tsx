'use client'

import Button from "@/src/components/ui/Button"
import { useRouter } from "next/navigation"
import useCurrentUser from "@/src/hooks/useCurrentUser" // On importe ton hook !
import useLoginModal from "@/src/hooks/useLoginModal"    // Pour pouvoir ouvrir le login si besoin

export default function ProfilePage() 
{
    const router = useRouter();
    const { user } = useCurrentUser(); // On récupère l'utilisateur connecté
    const loginModal = useLoginModal();

    const handleEditClick = () => {
        router.push('/profile/parameters');
    };

    // Sécurité : Si l'utilisateur n'est pas connecté
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center w-screen h-96 gap-4">
                <p className="text-xl text-white">Vous devez être connecté pour voir votre profil.</p>
                <Button 
                    label="Se connecter" 
                    onClick={() => loginModal.onOpen()} 
                />
            </div>
        );
    }

    return (    
        <div className="text-white p-6">
            {/* Header Profil Réel */}
            <div className="flex flex-col items-center justify-center w-full py-10 gap-4">
                {/* Image de profil (temporaire en attendant ta feature d'upload d'avatar) */}
                <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-black text-3xl font-bold">
                    {user.username?.charAt(0).toUpperCase()}
                </div>
                
                <h1 className="text-5xl font-bold text-yellow-400">
                    Profil de {user.username}
                </h1>
                <p className="text-gray-400">{user.email}</p>
                
                <Button
                    label="Parameters"
                    onClick={handleEditClick}
                />
            </div>

            {/* Statistiques et Historique */}
            <div className="flex flex-col md:flex-row gap-4 px-8 pb-8">
                {/* Historique des matchs */}
                <div className="flex-1 border border-green-500 rounded-2xl min-h-64 p-4">
                    <p className="text-center text-yellow-500 font-semibold mb-4">Historique des Matchs</p>
                    {/* Plus tard, tu feras un .map() sur tes matchs stockés en BDD */}
                    <p className="text-sm text-gray-400 text-center">Aucun match joué pour le moment.</p>
                </div>   

                {/* Classement / ELO */}
                <div className="flex-1 border border-green-500 rounded-2xl min-h-64 p-4">
                    <p className="text-center text-yellow-500 font-semibold mb-4">Statistiques & Elo</p>
                    <div className="text-center">
                        <span className="text-3xl font-bold text-white">1000</span> <span className="text-yellow-400 font-bold">LP</span>
                    </div>
                </div>

                {/* Liste d'Amis */}
                <div className="flex-1 border border-green-500 rounded-2xl min-h-64 p-4">
                    <p className="text-center text-yellow-500 font-semibold mb-4">Ami(s)</p>
                    <p className="text-sm text-gray-400 text-center">Vous n'avez pas encore d'amis.</p>
                </div>
            </div>
        </div>
    )
}