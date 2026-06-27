import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { listPendingReceived } from "@/src/lib/friends";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'secret-a-changer'
);

interface TokenPayload {
    id: string;
    username: string;
    email: string;
}

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return new NextResponse("Non autorisé", { status: 401 });
        }

        const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET);
        if (!payload || !payload.id) {
            return new NextResponse("Session invalide", { status: 401 });
        }

        const pendingRequests = await listPendingReceived(payload.id);

        return NextResponse.json(pendingRequests);
    } catch (error) {
        console.error("[GET_PENDING_FRIENDS_ERROR]", error);
        return new NextResponse("Erreur Interne", { status: 500 });
    }
}