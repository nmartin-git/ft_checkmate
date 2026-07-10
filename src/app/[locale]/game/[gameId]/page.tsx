import OnlineGameClient from "@/src/components/OnlineGameClient";
import { prisma } from "@/src/lib/prisma";
import { PUBLIC_USER_SELECT } from "@/src/lib/select";
import { notFound } from "next/navigation";

interface PageProps {
    params : Promise<{gameId : string}>
}

export default async function Page({ params }: PageProps) {
    const { gameId } = await params;

    // Charge la partie + les deux joueurs (pseudos, ELO, avatar) côté serveur
    const game = await prisma.game.findUnique({
        where: { id: gameId },
        select: {
            white_user: { select: PUBLIC_USER_SELECT },
            black_user: { select: PUBLIC_USER_SELECT },
        },
    });

    if (!game) notFound();

    return (
        <OnlineGameClient
            gameId={gameId}
            whitePlayer={game.white_user}
            blackPlayer={game.black_user}
        />
    );
}