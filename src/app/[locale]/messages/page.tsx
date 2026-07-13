import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getChatEnable, listConversations } from "@/src/lib/message";
import ConversationsClientView from "@/src/components/ConversationClientView";
import { getTranslations } from "next-intl/server";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-a-changer');
interface TokenPayload { id: string; }

export default async function MessagesPage() {
    const t = await getTranslations("errors");
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;
        if (!token)
			return <p className="text-white text-center mt-10">{t("not_connected")}</p>;

        const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET);
        const conversations = await listConversations(payload.id);
        const chatEnable = await getChatEnable(payload.id)

        return (
            <ConversationsClientView
                conversations={conversations}
                isChatEnabled={chatEnable}
            />
        );
    } catch (error) {
        console.error("Erreur chargement conversations:", error);
        return <p className="text-white text-center mt-10">{t("messages_load")}</p>;
    }
}
