import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { acceptFriendRequest, refuseFriendRequest } from "@/src/lib/friends";

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
            await acceptFriendRequest(payload.id, requesterId);
        } else if (action === "refuse") {
            await refuseFriendRequest(payload.id, requesterId);
        } else {
            return new NextResponse("Action invalide", { status: 400 });
        }
        
        return new NextResponse("Action complétée", { status: 200 });
    } catch (error) {
        console.error("[GAME_ACTION_ERROR]", error);
        return new NextResponse("Erreur Interne", { status: 500 });
    }
}