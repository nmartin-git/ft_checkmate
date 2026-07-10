import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { deleteAccount } from "@/src/lib/user";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'secret-a-changer'
);

interface TokenPayload {
    id: string;
    username: string;
    email: string;
}

export async function POST() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;
        if (!token)
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

        let payload: TokenPayload;
        try {
            const verified = await jwtVerify<TokenPayload>(token, JWT_SECRET);
            payload = verified.payload;
        } catch {
            return NextResponse.json({ error: "Session invalide" }, { status: 401 });
        }

        await deleteAccount(payload.id);

        const response = NextResponse.json({ success: true });
        response.cookies.set('auth-token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: new Date(0),
            path: '/'
        });
        return response;
    } catch (error) {
        console.error("delete account error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}