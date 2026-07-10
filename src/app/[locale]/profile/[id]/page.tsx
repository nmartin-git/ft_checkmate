import { getPlayerRank, getRecentMatches, eloHistoric} from "@/src/lib/stats";
import { getTranslations } from "next-intl/server";
import { getProfile } from "@/src/lib/user";
import ProfileClientView from "@/src/components/ProfileClientView";
import { findRequest, getFriendsCount, isFriends } from "@/src/lib/friends";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-a-changer');
interface TokenPayload { id: string; }

interface PublicProfileProps {
    params: Promise<{
        locale: string;
        id: string;
    }>;
}

export default async function PublicProfilePage({ params }: PublicProfileProps) {
    const t = await getTranslations("errors");
    try {
        const { id } = await params;
        const userData = await getProfile(id);
        
        if (!userData) {
            return <p className="text-white text-center mt-10">{t("player_not_found")}</p>;
        }

        const rank = await getPlayerRank(id);
        const friendsCount = await getFriendsCount(id);
        const matchHistory = await getRecentMatches(id, 3);
        const eloHistory = await eloHistoric(id);

        let isInitialPending = false;
        let isInitialFriend = false;

        try {
            const cookieStore = await cookies();
            const token = cookieStore.get('auth-token')?.value;
            if (token) {
                const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET);
                if (payload && payload.id) {
                    const pendingRequest = await findRequest(payload.id, id);
                    isInitialPending = pendingRequest;
                    const friendship = await isFriends(payload.id, id);
                    isInitialFriend = friendship;
                }
            }
        } catch {
        }

        return (
            <ProfileClientView
            matchHistory={matchHistory}
            eloHistory={eloHistory}
                userData={{
                    ...userData,
                    id: id,
                    isInitialPending,
                    isInitialFriend,
                }} 
                rank={rank}
                isPublicView={true}
                friendsCount={friendsCount}
            />
        );
    } catch (error) {
        console.error("Erreur profil public:", error);
        return <p className="text-white text-center mt-10">{t("generic")}</p>;
    }
}