import ProfileClientView from "@/src/components/ProfileClientView";
import { getFriendsCount } from "@/src/lib/friends";
import { eloHistoric, getPlayerRank, getRecentMatches } from "@/src/lib/stats";
import { getProfile } from "@/src/lib/user";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";


const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-a-changer');


export default async function ProfilePage (){
    const token = (await cookies()).get('auth-token')?.value;
    if (!token) return null; //ou redirect
    const {payload} = await jwtVerify<{id:string}>(token,JWT_SECRET);
    const id = payload.id;

    const [userData, rank, friendsCount, matchHistory, eloHistory]= await Promise.all([
        getProfile(id),
        getPlayerRank(id),
        getFriendsCount(id),
        getRecentMatches(id,3),
        eloHistoric(id)
    ]);
    return (<ProfileClientView 
                userData={{...userData, id}}
                rank={rank}
                friendsCount={friendsCount}
                matchHistory={matchHistory}
                eloHistory={eloHistory}
                isPublicView={false}
                />);
}