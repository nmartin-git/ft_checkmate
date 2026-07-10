import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { listConversations } from "@/src/lib/message";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "secret-a-changer"
);

interface TokenPayload {
  id: string;
  username: string;
  email: string;
}

export async function GET(_req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET);

    const conversations = await listConversations(payload.id);

    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error) {
    console.error("GET /api/chat/conversations error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}