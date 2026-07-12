import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { sendDirectMessage } from "@/src/lib/message";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-a-changer');
interface TokenPayload { id: string; }

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();
        const { receiverId, message } = body;

        if (!receiverId || !message) {
            return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
        }

        const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET);
        const senderId = payload.id;

        const newMessage = await sendDirectMessage(senderId, receiverId, message);

        return NextResponse.json(newMessage, { status: 201 });

    } catch (error: any) {
        console.error("Erreur API Chat:", error);
        
        return NextResponse.json(
            { error: error.message || "Une erreur est survenue lors de l'envoi" },
            { status: 400 }
        );
    }
}