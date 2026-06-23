'use client'

import { HiOutlineHome } from "react-icons/hi";
import TopbarItem from "@/src/components/ui/TopbarItem";
import Button from "@/src/components/ui/Button";
import useLoginModal from "@/src/hooks/useLoginModal";
import { useCallback } from "react";
import Notif from "@/src/components/ui/Notif";
import useCurrentUser from "@/src/hooks/useCurrentUser";
import Profile from "@/src/components/ui/Profile";
import { useRouter, usePathname } from "next/navigation";
import handleLogout from "@/src/lib/logout";
import { useTranslations, useLocale } from "next-intl"; 

const Topbar = () => {
    const loginModal = useLoginModal();
    const currentUser = useCurrentUser();
    const router = useRouter();
    const pathname = usePathname(); 
    const t = useTranslations();  
    const locale = useLocale();    

    const handleLoginClick = useCallback(() => {
        loginModal.onOpen();
    }, [loginModal]);


    const switchLocale = (newLocale: string) => {
        const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
        router.push(newPath);
    };

    const items = [
        {
            label: t('nav.home'),
            href: `/${locale}/`,
            icon: HiOutlineHome
        }
    ];

    return (
        <nav className="w-full bg-[#1e1c18] border-b border-[#2b2925] px-6 py-3 flex items-center justify-between shadow-md select-none">

            {}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(`/${locale}/`)}>
                    <span className="text-[#81b64c] text-xl font-black">♞</span>
                    <span className="text-white font-black text-lg tracking-wider uppercase hidden sm:inline">
                        Dames.com
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {items.map((item) => (
                        <TopbarItem
                            key={item.href}
                            href={item.href}
                            label={item.label}
                            icon={item.icon}
                        />
                    ))}
                </div>
            </div>

            {}
            <div className="hidden md:flex flex-col items-center text-center">
                <h2 className="text-gray-200 font-bold text-sm tracking-wide">
                    {t('game.title')} {}
                </h2>
                <p className="text-xs text-[#81b64c] font-medium font-mono px-2 py-0.5 bg-[#262522] rounded mt-0.5">
                    {t('game.vs')} {}
                </p>
            </div>

            {}
            <div className="flex items-center gap-4">

                <div className="flex items-center gap-2 border-r border-[#2b2925] pr-4">
                    {currentUser.user
                        ? <span className="text-sm text-gray-300 cursor-pointer font-bold max-w-[120px] truncate hover:text-gray-200 text-xl"
                            onClick={() => router.push(`/${locale}/profile/`)}>
                            {currentUser.user?.username}
                        </span>
                        : <Profile />
                    }
                    <Notif />
                </div>

                {}
                <div className="flex gap-1 border-r border-[#2b2925] pr-4">
                    {["fr", "en", "ar"].map((lang) => (
                        <button
                            key={lang}
                            onClick={() => switchLocale(lang)}
                            className={`text-xs font-bold uppercase px-2 py-1 rounded transition-all
                                ${locale === lang
                                    ? "text-[#81b64c] border border-[#81b64c]"
                                    : "text-gray-400 hover:text-white"
                                }`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {currentUser.user ? (
                        <Button
                            label={t('nav.logout')}
                            secondary
                            onClick={() => (handleLogout(currentUser.setUser), router.push(`/${locale}/`))}
                            large
                        />
                    ) : (
                        <Button
                            label={t('nav.login')}
                            secondary
                            onClick={handleLoginClick}
                            large
                        />
                    )}

                    <button
                        onClick={() => router.push(`/${locale}/game`)}
                        className="px-6 py-2.5 bg-[#81b64c] hover:bg-[#95ca5f] text-white text-xl font-black tracking-wider rounded-md border-b-[4px] border-[#537631] active:border-b-0 active:mt-[4px] transition-all uppercase">
                        {t('nav.play')}
                    </button>
                </div>

            </div>
        </nav>
    );
}

export default Topbar;