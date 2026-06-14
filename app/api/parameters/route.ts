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

export async function POST(request: Request) {
	try {
		const data = await request.formData()
		const chatEnable = data.get("Enabled") === "true"//TODO check if working
		const twoFactorAuthEnable = data.get("Enabled") === "true"//TODO check if working
		const cookieStore = await cookies();
		const token = cookieStore.get('auth-token')?.value
		if (!token)
		return NextResponse.json({user:null},{status : 401});
		const {payload} = await jwtVerify<TokenPayload>(token, JWT_SECRET)
		if (chatEnable)
			await updateChatEnable(payload.id, chatEnable)
		if (twoFactorAuthEnable)
			await updateTwoFactorAuth(payload.id, twoFactorAuthEnable)
		return NextResponse.json({ success: true, user: payload })
	} catch (error) {
    	console.error(error)
    	return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
	}
}