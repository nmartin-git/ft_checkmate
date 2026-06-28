import ProfileClientView from "@/src/components/ProfileClientView";
import { getPlayerRank } from "@/src/lib/stats";
import { getProfile } from "@/src/lib/user";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getFriendsCount } from "@/src/lib/friends";

import Button from "@/src/components/ui/Button"
import { useRouter } from "next/navigation"
import useLoginModal from "@/src/hooks/useLoginModal"
import useCurrentUser from "@/src/hooks/useCurrentUser"
import { useTranslations, useLocale } from "next-intl"

export default function ProfilePage() {
    const router = useRouter();
    const { user } = useCurrentUser();
    const loginModal = useLoginModal();
    const t = useTranslations('profile');
    const locale = useLocale();

    const handleEditClick = () => {
        router.push(`/${locale}/profile/parameters`);
    };

    if (!user) {
        router.push(`/${locale}/`);
        return null;
    }

    return (
        <div className="min-h-[calc(100vh-100px)] bg-[#262522] text-white p-6 md:p-10 select-none">

            <div className="max-w-6xl mx-auto bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">

                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left w-full">
                    <div className="w-24 h-24 bg-[#312e2b] border-2 border-[#45423f] rounded-md flex items-center justify-center text-[#81b64c] text-4xl font-black uppercase shadow-inner">
                        {user.username?.charAt(0).toUpperCase()}
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center justify-center sm:justify-start gap-3">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                                {user.username}
                            </h1>
                            <span className="bg-[#81b64c] text-white text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                {t('player')}
                            </span>
                        </div>
                        <p className="text-gray-400 font-medium text-sm md:text-base">{user.email}</p>
                    </div>
                </div>

                <div className="w-full md:w-auto flex justify-center md:justify-end">
                    <Button
                        label={t('parameters')}
                        secondary
                        onClick={handleEditClick}
                    />
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg p-6 shadow-xl flex flex-col justify-between min-h-64">
                    <div>
                        <p className="text-gray-300 font-black uppercase tracking-wider text-sm mb-4">
                            {t('matchs_title')}
                        </p>
                        <p className="text-sm text-gray-500 font-medium mt-6">{t('no_matchs')}</p>
                    </div>
                </div>

                <div className="bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg p-6 shadow-xl flex flex-col justify-between min-h-64">
                    <div>
                        <p className="text-gray-300 font-black uppercase tracking-wider text-sm mb-4">
                            {t('elo_title')}
                        </p>
                        <div className="flex items-baseline gap-2 mt-6">
                            <span className="text-5xl font-black text-white tracking-tight">1000</span>
                            <span className="text-[#81b64c] font-black text-lg uppercase">LP</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg p-6 shadow-xl flex flex-col justify-between min-h-64">
                    <div>
                        <p className="text-gray-300 font-black uppercase tracking-wider text-sm mb-4">
                            {t('friends_title')}
                        </p>
                        <p className="text-sm text-gray-500 font-medium mt-6">{t('no_friends')}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}