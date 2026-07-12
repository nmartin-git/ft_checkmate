import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getChatEnable, listConversations } from "@/src/lib/message";
import ConversationsClientView from "@/src/components/ConversationClientView";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-a-changer');
interface TokenPayload { id: string; }

export default async function MessagesPage() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;
        if (!token)
			return <p className="text-white text-center mt-10">Non connecté</p>;

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
        return <p className="text-white text-center mt-10">Erreur lors du chargement des messages.</p>;
    }
}
