'use client'

import { HiOutlineHome } from "react-icons/hi";
import TopbarItem from "@/src/components/ui/TopbarItem";
import Button from "@/src/components/ui/Button";
import useLoginModal from "@/src/hooks/useLoginModal";
import { useCallback } from "react";
import Notif from "@/src/components/ui/Notif";
import useCurrentUser from "@/src/hooks/useCurrentUser";
import Profile from "@/src/components/ui/Profile";
import { useRouter } from "next/navigation";
import handleLogout from "../lib/logout";

const Topbar = () => {
    const loginModal = useLoginModal();
    const { user } = useCurrentUser();
    const router = useRouter();

    const handleLoginClick = useCallback(() => {
        loginModal.onOpen();
    }, [loginModal]);

    const items = [
        {
            label: 'Home',
            href: '/',
            icon: HiOutlineHome
        }
    ];

    return (
        <nav className="w-full bg-[#1e1c18] border-b border-[#2b2925] px-6 py-3 flex items-center justify-between shadow-md select-none">
            
            {/* BLOC GAUCHE : Titre du site & Navigation de base */}
            <div className="flex items-center gap-6">
                <div className="flex 
								items-center 
								gap-2 
								cursor-pointer" onClick={() => router.push('/')}>
                    <span className="text-[#81b64c] 
							text-xl 
							font-black">♞</span>
                    <span className="text-white 
							font-black 
							text-lg 
							tracking-wider 
							uppercase hidden sm:inline">
                        Dames.com
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    {items.map((item) => (
                        <TopbarItem s
                            key={item.href}
                            href={item.href}
                            label={item.label}
                            icon={item.icon}
                        />
                    ))}
                </div>
            </div>

            {/* BLOC CENTRE : Infos de jeu (Propre, discret, sans collision) */}
            <div className="hidden md:flex flex-col items-center text-center">
                <h2 className="text-gray-200 font-bold text-sm tracking-wide">Jeu de Dames</h2>
                <p className="text-xs text-[#81b64c] font-medium font-mono px-2 py-0.5 bg-[#262522] rounded mt-0.5">
                    Player 1 VS Player 2
                </p>
            </div>

            {/* BLOC DROITE : Profil, Notifs & Actions d'authentification / Play */}
            <div className="flex items-center gap-4">
                
                {/* Profil et Notifications groupés */}
                <div className="flex items-center gap-2 border-r border-[#2b2925] pr-4">
                    <Profile />
                    <Notif />
                </div>

                {/* Utilisateur connecté VS Déconnecté */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-300 font-bold max-w-[120px] truncate">
                                {user.username}
                            </span>
                            <Button label='Logout' secondary onClick={handleLogout} />
                        </div>
                    ) : (
                        <Button label="Login" secondary onClick={handleLoginClick} large/>	
                    )}

                    {/* Le Gros Bouton PLAY à la Chess.com */}
                    <button 
                        onClick={() => router.push('/game')} 
                        className="px-6 
								py-2.5
								bg-[#81b64c] 
								hover:bg-[#95ca5f] 
								text-white text-xl 
								font-black tracking-wider 
								rounded-md border-b-[4px] 
								border-[#537631] active:border-b-0 
								active:mt-[4px] transition-all uppercase">
									PLAY</button>
                </div>

            </div>
        </nav>
    );
}

export default Topbar;