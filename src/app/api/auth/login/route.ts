import { SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, setTwoFactorAuth, verifyPassword, verifyTwoFactorAuth, verifyRecoveryCode } from '@/src/lib/auth';

//TODO DEBUG LOGIN POUR SAVOIR OU CA PECHE (AVEC LES ERREURS )

const JWT_SECRET =new TextEncoder().encode(
    process.env.JWT_SECRET || 'secret-temporaire-a-changer'
);

export async function POST(req : NextRequest)
{
    try {
        const body = await req.json();
        if (body.code || body.recoveryCode) {
            const { email } = body;
            if (body.code)
            {
                const { code } = body;
                if (!email) {
                    return (NextResponse.json(
                        { error: 'Email missing for 2FaA verification' },
                        { status : 400 }));
                }
                const isCodeValid = await verifyTwoFactorAuth(email, code);
                if (!isCodeValid) {
                    return (NextResponse.json(
                        { error: 'Invalid two factor identification code'},
                        { status : 401 }));
                }
            }
            else
            {
                const { recoveryCode } = body;
                if (!email) {
                    return (NextResponse.json(
                        { error: 'Email missing for 2FaA verification' },
                        { status : 400 }));
                }
                const isCodeValid = await verifyRecoveryCode(email, recoveryCode);
                if (!isCodeValid) {
                    return (NextResponse.json(
                        { error: 'Invalid two factor identification code'},
                        { status : 401 }));
                }
            }
        const user = await getUserByEmail(email)
        const token = await new SignJWT({
            id : user.userId,
            username : user.userUsername,
            email : email
        }).setProtectedHeader({alg :'HS256'})
        .setExpirationTime('1d')
        .sign(JWT_SECRET);

        const response = (NextResponse.json({
            message : 'Connexion reussie',
            user : {
                id : user.userId,
                username : user.userUsername,
                email: email
            },
            status : 200,
			success: true,
			twoFactorAuthEnable: false
            }));

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
            path: '/'
        });
        return (response);
    }
    const { email, password } = body;
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
    if (a2fEnable)
	{
        await setTwoFactorAuth(email)
		return (NextResponse.json({
            error: 'Two factor identification code sent',
			success: false,
			twoFactorAuthEnable: true
        }));
	}
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
		success: true,
		twoFactorAuthEnable: false
    }));

    response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/'
    });
    return (response);
    } catch (error) {
        console.error('Login error', error);
        return NextResponse.json(
            { error: "Servor error" },
            { status : 500 });       
    }
}