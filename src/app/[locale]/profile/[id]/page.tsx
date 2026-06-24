import { getPlayerRank } from "@/src/lib/stats";
import { getProfile } from "@/src/lib/user";
import ProfileClientView from "@/src/components/ProfileClientView";

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

        return (
            <ProfileClientView 
                userData={userData} 
                rank={rank}
                isPublicView={true}
            />
        );
    } catch (error) {
        console.error("Erreur profil public:", error);
        return <p className="text-white text-center mt-10">Une erreur est survenue.</p>;
    }
}