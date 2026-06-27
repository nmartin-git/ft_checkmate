import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { sendFriendRequest, cancelFriendRequest, findRequest } from "@/src/lib/friends";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-a-changer');
interface TokenPayload { id: string; }

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;
        if (!token) return new NextResponse("Non autorisé", { status: 401 });

        const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET);
        const { friendId } = await request.json();

        if (!friendId) return new NextResponse("ID ami manquant", { status: 400 });

        const existingRequest = await findRequest(payload.id, friendId);

        if (existingRequest) {
            await cancelFriendRequest(payload.id, friendId);
            return NextResponse.json({ status: "CANCELLED" });
        } else {
            await sendFriendRequest(payload.id, friendId);
            return NextResponse.json({ status: "SENT" });
        }

    } catch (error) {
        console.error("[FRIEND_REQUEST_TOGGLE_ERROR]", error);
        return new NextResponse("Erreur interne", { status: 500 });
    }
}