import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getConversation, markConversationRead, sendDirectMessage } from "@/src/lib/message";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "secret-a-changer"
);

interface TokenPayload {
  id: string;
  username: string;
  email: string;
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET);

    const { searchParams } = new URL(req.url);
    const otherId = searchParams.get("otherId");
    const takeParam = searchParams.get("take");
    const beforeParam = searchParams.get("before");

    if (!otherId) {
      return NextResponse.json({ error: "Missing otherId" }, { status: 400 });
    }

    const take = takeParam ? Number(takeParam) : undefined;
    const before = beforeParam ? new Date(beforeParam) : undefined;

    const messages = await getConversation(payload.id, otherId, take, before);

    await markConversationRead(payload.id, otherId);

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("GET /api/chat/messages error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET);

    const body = await req.json();
    const receiverId = body?.receiverId as string | undefined;
    const message = body?.message as string | undefined;

    if (!receiverId || typeof message !== "string") {
      return NextResponse.json(
        { error: "receiverId and message are required" },
        { status: 400 }
      );
    }

    const createdMessage = await sendDirectMessage(payload.id, receiverId, message);

    return NextResponse.json({ message: createdMessage }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/chat/messages error:", error);
    return NextResponse.json(
      { error: error?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}