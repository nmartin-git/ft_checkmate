import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/src/lib/prisma";
import { follow_status } from "@prisma/client";
import { openGameRequest, closeGameRequest, isGameRequested, isGameRequestedBis, isActiveRequest, newGame, getGameId } from "@/src/lib/game";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'secret-a-changer'
);

interface TokenPayload { id: string; }

export async function GET(request : Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;
        if (!token)
			return new NextResponse("Non autorisé", { status: 401 });
        const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET);
        const {searchParams} = new URL(request.url);
        const friendId = searchParams.get("friendId");
		const activeRequests = await isActiveRequest(payload.id, payload.id);
        const gameId = friendId ? await getGameId(payload.id, friendId) : null;
        //recuperer le gameID
        return NextResponse.json({activeRequests, gameId});
    } catch (error) {
        console.error("[GET_MATCHMAKING_ERROR]", error);
        return new NextResponse("Erreur interne", { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;
        if (!token)
			return new NextResponse("Non autorisé", { status: 401 });

        const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET);
        const { searchParams } = new URL(request.url);
        const friendId = searchParams.get("friendId");

        if (!friendId)
			return new NextResponse("Identifiant ami manquant", { status: 400 });

        const hasActiveOutbound = await isGameRequested(payload.id);
        
        if (hasActiveOutbound) {
            const currentRequestWithThisFriend = await isGameRequestedBis(payload.id, friendId);
            if (currentRequestWithThisFriend) {
                await closeGameRequest(payload.id, friendId);
                return NextResponse.json({ status: "CANCELED" });
            }
            return new NextResponse("Vous avez déjà un défi en cours avec un autre joueur.", { status: 400 });
        }

        const inboundChallenge = await isGameRequestedBis(friendId, payload.id);

        if (inboundChallenge) {
			await closeGameRequest(payload.id, friendId);
            const [whitePlayer, blackPlayer] = Math.random() < 0.5 
                ? [payload.id, friendId] : [friendId,payload.id];
            const game = await newGame(whitePlayer, blackPlayer);
            return NextResponse.json({ status: "LAUNCHED", gameId : game.id});
        }
        await openGameRequest(payload.id, friendId);
        return NextResponse.json({ status: "PENDING" });
    } catch (error) {
        console.error("[POST_MATCHMAKING_ERROR]", error);
        return new NextResponse("Erreur interne", { status: 500 });
    }
}