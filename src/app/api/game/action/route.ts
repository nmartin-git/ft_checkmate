import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { acceptFriendRequest, refuseFriendRequest } from "@/src/lib/friends";
import { AcceptGameRequest, newGame, refuseGameRequest } from "@/src/lib/game";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-a-changer');

interface TokenPayload { id: string; }

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;
        if (!token) return new NextResponse("Non autorisé", { status: 401 });

        const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET);
        const { requesterId, action } = await request.json();

        if (!requesterId) return new NextResponse("ID manquant", { status: 400 });

        if (action === "accept") {
            await AcceptGameRequest(payload.id, requesterId);
            const [whitePlayerID, blackPlayerID] = Math.random() < 0.5 ? [payload.id, requesterId] : [requesterId, payload.id];
            const game = await newGame(whitePlayerID, blackPlayerID);
            return NextResponse.json({ status: "LAUNCHED", gameId: game.id });
        } else if (action === "refuse") {
            await refuseGameRequest(payload.id, requesterId);
            return NextResponse.json({ status: "REFUSED" });
        } else {
            return new NextResponse("Action invalide", { status: 400 });
        }

        return new NextResponse("Action complétée", { status: 200 });
    } catch (error) {
        console.error("[FRIEND_ACTION_ERROR]", error);
        return new NextResponse("Erreur Interne", { status: 500 });
    }
}