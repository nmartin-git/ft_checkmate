import { getPlayerRank, getRecentMatches, eloHistoric } from "@/src/lib/stats";
import { getProfile } from "@/src/lib/user";
import ProfileClientView from "@/src/components/ProfileClientView";
import { getFriendsCount } from "@/src/lib/friends";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-a-changer');
interface TokenPayload { id: string; }

interface ProfilePageProps {
    params: Promise<{ locale: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { locale } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) {
        redirect(`/${locale}/`);
    }

    let userId: string;
    try {
        const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET);
        userId = payload.id;
    } catch {
        redirect(`/${locale}/`); 
    }

    try {
        const userData = await getProfile(userId);
        const rank = await getPlayerRank(userId);
        const friendsCount = await getFriendsCount(userId);
        const matchHistory = await getRecentMatches(userId, 3);
        const eloHistory = await eloHistoric(userId);

        return (
            <ProfileClientView
                userData={{ ...userData, id: userId }}
                rank={rank}
                isPublicView={false}
                friendsCount={friendsCount}
                matchHistory={matchHistory}
                eloHistory={eloHistory}
            />
        );
    } catch (error) {
        console.error("Erreur profil:", error);
        return <p className="text-white text-center mt-10">Une erreur est survenue.</p>;
    }
}