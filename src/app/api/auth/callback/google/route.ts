import { SignJWT } from 'jose';
import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/src/lib/auth";
import { inscriptionClassic } from "@/src/lib/user";

const JWT_SECRET =new TextEncoder().encode(
    process.env.JWT_SECRET || 'secret-temporaire-a-changer'
);

const PUBLIC_ORIGIN = process.env.NEXTAUTH_URL || 'https://localhost';

export async function GET(request: NextRequest)
{
	const searchParams = request.nextUrl.searchParams;
	const code = searchParams.get("code");
	const error = searchParams.get("error");
	if (error) {
		return NextResponse.redirect(new URL("/login?error=access_denied", PUBLIC_ORIGIN));
	}
	if (!code) {
	    return NextResponse.redirect(new URL("/login?error=missing_code", PUBLIC_ORIGIN));
	}
	try {
		const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code: code,
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
                client_secret: process.env.GOOGLE_CLIENT_SECRET || "", // CLÉ SECRÈTE (Serveur uniquement)
                redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
                grant_type: "authorization_code",
            }),
        });
		const tokens = await tokenResponse.json();
		if (!tokenResponse.ok) {
			throw new Error(tokens.error_description || "Token swap failed")
		}
		const payloadBase64 = tokens.id_token.split(".")[1];
        const userJson = JSON.parse(Buffer.from(payloadBase64, "base64").toString());
		const email = userJson.email;
		let user = await getUserByEmail(email).catch(() => null);
		if (!user) {
    		const username = email.split('@')[0].slice(0,12);
    		if (!username) {
      			return NextResponse.json({ error: 'Invalid register data' }, { status: 409 });
			}
    		const newUserId = await inscriptionClassic(email, username, null);
    		if (!newUserId) {
    		    return NextResponse.json({ error: 'Cet email existe déjà' }, { status: 409 });
    		}
    		user = { userId: newUserId, userUsername: username };
		}
		const { userId, userUsername } = user;
		const token = await new SignJWT({
			id : userId,
			username : userUsername,
			email : email
		}).setProtectedHeader({alg :'HS256'})
		.setExpirationTime('1d')
		.sign(JWT_SECRET);
		const response = NextResponse.redirect(new URL("/", PUBLIC_ORIGIN));
		response.cookies.set('auth-token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24,
			path: '/'
		});
		return (response);
	} catch (error) {
		console.error('Callback error', error);
		return NextResponse.json({ error: "Server error" }, { status : 500 });
	}
}