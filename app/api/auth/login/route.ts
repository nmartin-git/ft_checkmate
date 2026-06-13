import { SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { setTwoFactorAuth, verifyPassword } from '@/src/lib/auth';


const JWT_SECRET =new TextEncoder().encode(
    process.env.JWT_SECRET || 'secret-temporaire-a-changer'
);

export async function POST(req : NextRequest)
{
    try {
        const {email, password} = await req.json();
        if (!email || !password){
            return (NextResponse.json({error: 'Please enter email and password'},
                {status : 400}
            ));
        }
        const {userId, userUsername, a2fEnable} = await verifyPassword(email, password)
        if (!userId)
        {
            return (NextResponse.json({error: 'Email or Password incorrect'},
                {status : 401}
            ));
        }
        // if (a2fEnable)
        // {
        //     setRequires2FA(true);
        //     setStep(2);
        // }
	    // {
        //     await setTwoFactorAuth(email)
		//     // return (verifyTwoFactorAuth(userEmail, input));//TODO: check 2FA
		//     return (NextResponse.json({error: 'Two factor dientification code is invalid'},
        //         {status : 401}
        //     ));
	    // }
        const token = await new SignJWT({
            id : userId,
            username : userUsername,
            email : email
        }).setProtectedHeader({alg :'HS256'})
        .setExpirationTime('1d')
        .sign(JWT_SECRET);

        const response = (NextResponse.json({
            message : 'Connexion reussie',
            user : {
                id : userId,
                username : userUsername,
                email: email
            },
            status : 200
                }            
            ));

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
            path: '/'
        });
        return response;
    } catch (error) {
        console.error('Erreur lors du login', error);
        return NextResponse.json({
            error: "Erreur Server",
            status : 500
        });       
    }
}