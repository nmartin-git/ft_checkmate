import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { loadDiscussion } from "@/src/lib/message";
import DiscussionClientView from "@/src/components/DiscussionClientView";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-a-changer');
interface TokenPayload { id: string; }

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function DiscussionPage({ params }: PageProps) {
    const { id: targetUserId } = await params;

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;
        if (!token)
			return <p className="text-white text-center mt-10">Non connecté</p>;

        const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET);
        const currentUserId = payload.id;

        if (currentUserId === targetUserId) {
            return <p className="text-white text-center mt-10">Impossible de discuter avec soi-même.</p>;
        }

        const {initialMessages, partnerUser, chatEnable} = await loadDiscussion(currentUserId, targetUserId);

        if (!partnerUser)
			return <p className="text-white text-center mt-10">Utilisateur introuvable.</p>;

        return (
            <DiscussionClientView 
                initialMessages={initialMessages} 
                currentUserId={currentUserId} 
                partner={partnerUser}
                isChatEnabled={chatEnable}
            />
        );
    } catch (error) {
        console.error("Erreur salon de discussion:", error);
        return <p className="text-white text-center mt-10">Une erreur est survenue.</p>;
    }
}