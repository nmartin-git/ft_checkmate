'use client'
import Image from "next/image";
import DamesImg from "@/public/board.png";
import { useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useLoginModal from "@/src/hooks/useLoginModal";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import usePlayModal from "@/src/hooks/usePlayModal";

export default function Home() {
    const searchParams = useSearchParams();
    const loginModal = useLoginModal();
    const playModal = usePlayModal();
    const router = useRouter();
    const t = useTranslations(); 
    const locale = useLocale(); 

    useEffect(() => {
        if (searchParams.get('auth') === 'required')
            loginModal.onOpen();
    }, [searchParams, loginModal]);

    const handlePlayClick = useCallback(() => {
            playModal.onOpen();
        }, [playModal]);

    return (
        <main className="min-h-[calc(100vh-61px)] bg-[#262522] flex items-center justify-center p-4 md:p-8">
            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                <div className="lg:col-span-7 flex justify-center">
                    <div className="bg-[#1e1c18] p-3 rounded shadow-2xl border border-[#312e2b]">
                        <div id="board" className="relative cursor-pointer overflow-hidden rounded-sm group">
                            <Image
                                onClick={() => alert("click on board")}
                                src={DamesImg}
                                alt="jeu de dames"
                                width={520}
                                height={520}
                                priority
                            />
                        </div>
                    </div>
                </div>

                {/* Carte de droite */}
                <div className="lg:col-span-5 bg-[#1e1c18] border border-[#2b2925] rounded-md p-6 shadow-xl flex flex-col justify-between min-h-[260px]">
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
                            {t('home.title')}
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {t('home.subtitle')}
                        </p>
                    </div>

                    <button
                        onClick={handlePlayClick}
                        className="w-full py-4 bg-[#81b64c] hover:bg-[#95ca5f] text-white font-black text-xl tracking-wide rounded border-b-[4px] border-[#537631] active:border-b-0 active:mt-[4px] transition-all shadow-lg uppercase"
                    >
                        {t('home.play')}
                    </button>
                </div>

            </div>
        </main>
    );
}