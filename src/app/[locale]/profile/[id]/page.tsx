import { getPlayerRank } from "@/src/lib/stats";
import { getProfile } from "@/src/lib/user";
import ProfileClientView from "@/src/components/ProfileClientView";
import { findRequest, getFriendsCount } from "@/src/lib/friends";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/src/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-a-changer');
interface TokenPayload { id: string; }

interface PublicProfileProps {
    params: Promise<{
        locale: string;
        id: string;
    }>;
}

export default async function PublicProfilePage({ params }: PublicProfileProps) {
    try {
        const { id } = await params;
        const userData = await getProfile(id);
        
        if (!userData) {
            return <p className="text-white text-center mt-10">Joueur introuvable.</p>;
        }

        const rank = await getPlayerRank(id);
        const friendsCount = await getFriendsCount(id);

        let isInitialPending = false;
        try {
            const cookieStore = await cookies();
            const token = cookieStore.get('auth-token')?.value;
            if (token) {
                const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET);
                if (payload && payload.id) {
                    const pendingRequest = findRequest(payload.id, id);
                    isInitialPending = !!pendingRequest;
                }
            }
        } catch {
        }

        return (
            <ProfileClientView 
                userData={{
                    ...userData,
                    id: id,
                    isInitialPending
                }} 
                rank={rank}
                isPublicView={true}
                friendsCount={friendsCount}
            />
        );
    } catch (error) {
        console.error("Erreur profil public:", error);
        return <p className="text-white text-center mt-10">Une erreur est survenue.</p>;
    }
}