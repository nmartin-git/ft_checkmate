import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { writeFile } from "fs/promises"
import { join } from "path"
import { updateChatEnable, updateTwoFactorAuth, getParameters, updateUserField } from "@/src/lib/user"
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

export async function GET() {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get('auth-token')?.value
		if (!token)
			return NextResponse.json({user:null},{status : 401});
		const {payload} = await jwtVerify<TokenPayload>(token, JWT_SECRET)
		const parameters = await getParameters(payload.id)
		return NextResponse.json({
			avatar: parameters.avatar,
			chatEnable: parameters.chatEnable,
			twoFactorAuthEnable: parameters.twoFactorAuthEnable,
			birthdate: parameters.birthdate
		});
	} catch (error) {
    	console.error(error)
    	return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
	}
}

export async function POST(request: Request) {
	try {
		const data = await request.formData()
		const cookieStore = await cookies();
		const token = cookieStore.get('auth-token')?.value
		if (!token)
			return NextResponse.json({user:null},{status : 401});
		const {payload} = await jwtVerify<TokenPayload>(token, JWT_SECRET)
		const chatEnable = data.get("chatEnable")
		const twoFactorAuthEnable = data.get("twoFactorAuthEnable")
		const birthdate = data.get("birthdate")
		let recoveryCodes = null
		if (birthdate !== null) {
   			const birthdateString = String(birthdate);
			const birthdateValue = (birthdateString === "undefined" || birthdateString === "") 
        	? null 
        	: new Date(birthdateString);
			updateUserField(payload.id, { birthdate: birthdateValue })
		}
		if (chatEnable !== null)
			await updateChatEnable(payload.id, chatEnable === "true")
		if (twoFactorAuthEnable !== null)
			recoveryCodes = await updateTwoFactorAuth(payload.id, twoFactorAuthEnable === "true")
		return NextResponse.json({ success: true, user: payload, chatEnable: chatEnable === "true",
    		twoFactorAuthEnable: twoFactorAuthEnable === "true", recoveryCodes: recoveryCodes });
	} catch (error) {
    	console.error(error)
    	return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
	}
}