'use client'
import useCurrentUser from "@/src/hooks/useCurrentUser";
import useLoginModal from "@/src/hooks/useLoginModal";
import Button from "./Button";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

const Profile = () => {
    const { user } = useCurrentUser();
    const LoginModal = useLoginModal();
    const router = useRouter();
    const t = useTranslations();  
    const locale = useLocale(); 

    const handleClick = () => {
        if (user) {
            router.push(`/${locale}/profile`);
        } else {
            LoginModal.onOpen();
        }
    }

    return <Button label={t('nav.profile')} onClick={handleClick} large />
}

export default Profile;