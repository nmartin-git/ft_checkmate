'use client'

import Image from "next/image";
import DamesImg from "@/public/board.png";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useLoginModal from "@/src/hooks/useLoginModal";
import { useRouter } from "next/navigation";

export default function Home() {
    const searchParams = useSearchParams();
    const loginModal = useLoginModal();
	const router = useRouter();

    useEffect(() => {
        if (searchParams.get('auth') === 'required')
            loginModal.onOpen();
    }, [searchParams, loginModal]);

    return (
        <main className="min-h-[calc(100vh-61px)] bg-[#262522] flex items-center justify-center p-4 md:p-8">
            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* COLONNE GAUCHE : Le Plateau de jeu */}
                <div className="lg:col-span-7 flex justify-center">
                    <div className="bg-[#1e1c18] p-3 rounded shadow-2xl border border-[#312e2b]">
                        <div id="board" className="relative cursor-pointer overflow-hidden rounded-sm group">
                            <Image 
                                onClick={() => { alert("click on board") }}
                                src={DamesImg}
                                alt="jeu de dames"
                                width={520}
                                height={520}
                                priority
                            />
                        </div>
                    </div>
                </div>

                {/* COLONNE DROITE : Le panneau de contrôle style Chess.com */}
                <div className="lg:col-span-5 bg-[#1e1c18] border border-[#2b2925] rounded-md p-6 shadow-xl flex flex-col justify-between min-h-[260px]">
                    
                    {/* Entête du panneau */}
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
                            Jouer aux Dames
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Lancez une partie de Dames endiablE contre vos amis !
                        </p>
                    </div>

                   {/* LE GROS BOUTON VERT RECTANGULAIRE (Typique Chess.com) */}
                    <button 
                        onClick={() => router.push('/game')}
                        className="w-full py-4
						 bg-[#45a049] bg-[#81b64c]
						 hover:bg-[#95ca5f]
						 text-white font-black
						 text-xl tracking-wide
						 rounded border-b-[4px] border-[#537631] active:border-b-0
						active:mt-[4px] transition-all
						shadow-lg uppercase"
                    >
                        Jouer ➔
                    </button>

                </div>

            </div>
        </main>
    );
}