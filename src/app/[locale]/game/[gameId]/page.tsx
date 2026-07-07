import OnlineGameClient from "@/src/components/OnlineGameClient";

interface PageProps {
    params : Promise<{gameId : string}>
}

export default async function Page({ params} : PageProps){
    const {gameId} = await params;
    return <OnlineGameClient gameId ={gameId} />
}