import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { writeFile } from "fs/promises"
import { join } from "path"
import { updateChatEnable, updateTwoFactorAuth } from "@/src/lib/user"
import { jwtVerify, JWTPayload } from "jose";
import { cookies } from "next/headers";


const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'secret-a-changer'
);

interface TokenPayload{
  id : string,
  username : string,
  email : string
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token)
        return NextResponse.json({user:null},{status : 401});
    const {payload} = await jwtVerify<TokenPayload>(token, JWT_SECRET)
    return NextResponse.json({ success: true, user:{
      id : payload.id,
      email : payload.email,
      username : payload.username
    } });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}