import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { removeFriend } from "@/src/lib/friends";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'secret-a-changer'
);

interface TokenPayload { id: string; }

export async function DELETE(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) return new NextResponse("Non autorisé", { status: 401 });

        const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET);
        const { searchParams } = new URL(request.url);
        const friendId = searchParams.get("friendId");

        if (!friendId) {
            return new NextResponse("Identifiant ami manquant", { status: 400 });
        }

        await removeFriend(payload.id, friendId);

        return new NextResponse("Ami supprimé avec succès", { status: 200 });
    } catch (error) {
        console.error("[REMOVE_FRIEND_ERROR]", error);
        return new NextResponse("Erreur interne", { status: 500 });
    }
}