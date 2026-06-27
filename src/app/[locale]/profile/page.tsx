import ProfileClientView from "@/src/components/ProfileClientView";
import { getPlayerRank } from "@/src/lib/stats";
import { getProfile } from "@/src/lib/user";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getFriendsCount } from "@/src/lib/friends";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'secret-a-changer'
);

interface TokenPayload {
    id: string;
    username: string;
    email: string;
}

export default async function ProfilePage() 
{
   try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return <p className="text-white text-center mt-10">Non connecté</p>;
        }
        const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET);
        if (!payload || !payload.id) {
            return <p className="text-white text-center mt-10">Session invalide</p>;
        } return (
        <ProfileClientView
            userData={await getProfile(payload.id)}
            rank={await getPlayerRank(payload.id)}
            friendsCount={await getFriendsCount(payload.id)}
        />
    );
    } catch (error) {
        console.error("Erreur de session serveur:", error);
        return <p className="text-white text-center mt-10">Une erreur est survenue lors du chargement du profil.</p>;
    }
}