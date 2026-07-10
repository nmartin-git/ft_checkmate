'use client'

import { useState } from "react";
import Modal from "@/src/components/ui/Modal";
import usePlayModal from "@/src/hooks/usePlayModal";
import useLoginModal from "@/src/hooks/useLoginModal";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import useCurrentUser from "@/src/hooks/useCurrentUser";

export default function PlayModal() {
    const { isOpen, onClose } = usePlayModal();
    const [selectedMode, setSelectedMode] = useState<"online" | "local">("local");
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("lobby");
	const loginModal = useLoginModal();
	const { user } = useCurrentUser();

    const handleGameLaunch = () => {
        if (!selectedMode) return;
        
        onClose();
        if (selectedMode === "online") {
			if (user)
            	router.push(`/${locale}/game/online/matchmaking`);
            	// router.push(`/${locale}/game`);
			else
			{
				router.push(`/${locale}/`);
				loginModal.onOpen();
			}
        } else {
            router.push(`/${locale}/game/local`);
        }
    };

    const modalBody = (
        <div className="flex flex-col gap-4 mt-2">
            <p className="text-sm text-gray-400 mb-2 font-medium">
                {t("mode")}
            </p>
            
            <button
                onClick={() => setSelectedMode("online")}
                className={`flex items-center gap-5 w-full p-5 rounded-lg border-2 text-left transition-all duration-200 group relative overflow-hidden ${
                    selectedMode === "online" 
                        ? "border-[#81b64c] bg-[#262522] shadow-lg shadow-[#81b64c]/10" 
                        : "border-[#2b2925] bg-[#211f1b] hover:border-[#45423f] hover:bg-[#262522]"
                }`}
            >
                <div className="absolute right-4 -bottom-2.5 text-7xl opacity-5 pointer-events-none select-none">⚡</div>
                <div className={`flex items-center justify-center w-14 h-14 rounded-md text-3xl transition-transform duration-200 group-hover:scale-110 ${
                    selectedMode === "online" ? "bg-[#81b64c]/20" : "bg-[#2b2925]"
                }`}>
                    🌐
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-black text-white text-lg tracking-wide uppercase flex items-center gap-2">
                        {t("online")}
                        <span className="bg-[#81b64c] text-white text-[10px] font-black px-1.5 py-0.5 rounded normal-case tracking-normal">{t("ranked")}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 font-medium leading-relaxed">
                        {t("online_desc")}
                    </div>
                </div>
            </button>

            <button
                onClick={() => setSelectedMode("local")}
                className={`flex items-center gap-5 w-full p-5 rounded-lg border-2 text-left transition-all duration-200 group relative overflow-hidden ${
                    selectedMode === "local" 
                        ? "border-[#33b4e5] bg-[#262522] shadow-lg shadow-[#33b4e5]/10" 
                        : "border-[#2b2925] bg-[#211f1b] hover:border-[#45423f] hover:bg-[#262522]"
                }`}
            >
                <div className="absolute right-4 -bottom-2.5 text-7xl opacity-5 pointer-events-none select-none">🤝</div>
                <div className={`flex items-center justify-center w-14 h-14 rounded-md text-3xl transition-transform duration-200 group-hover:scale-110 ${
                    selectedMode === "local" ? "bg-[#33b4e5]/20" : "bg-[#2b2925]"
                }`}>
                    🖥️
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-black text-white text-lg tracking-wide uppercase">{t("local")}</div>
                    <div className="text-xs text-gray-400 mt-0.5 font-medium leading-relaxed">
                        {t("local_desc")}
                    </div>
                </div>
            </button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                onClose();
                setSelectedMode("local");
            }}
            onSubmit={handleGameLaunch}
            title={t("mode")}
            body={modalBody}
            actionLabel={selectedMode === "online" ? t("challenge_friends") : t("launch_local")}
            disabled={false}
        />
    );
}