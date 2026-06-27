import { NextResponse } from "next/server";
import useCurrentUser from "@/src/hooks/useCurrentUser";
import { searchPlayer } from "@/src/lib/user";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'secret-a-changer'
);

interface TokenPayload {
    id: string;
    username: string;
    email: string;
}

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return new NextResponse("Non autorisé - Aucun jeton", { status: 401 });
        }

        const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET);
        if (!payload || !payload.id) {
            return new NextResponse("Non autorisé - Jeton invalide", { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        if (!query || query.trim() === "") {
            return NextResponse.json([]);
        }
        return NextResponse.json(await searchPlayer(payload.id, query));
    } catch (error) {
        console.error("[USERS_SEARCH_ERROR]", error);
        return new NextResponse("Erreur Interne", { status: 500 });
    }
}