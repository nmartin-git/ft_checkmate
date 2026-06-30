import { NextRequest, NextResponse } from 'next/server';
import { inscriptionClassic } from '@/src/lib/user';
import { SignJWT } from 'jose';

const JWT_SECRET =new TextEncoder().encode(
    process.env.JWT_SECRET || 'secret-temporaire-a-changer'
);

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }
    const userId = await inscriptionClassic(email, username, password)
    if (!userId) {
      return NextResponse.json(
        { error: 'This email or username already exists' },
        { status: 409 }
      );
    }
       const token = await new SignJWT({
           id : userId,
           username : username,
           email : email
       }).setProtectedHeader({alg :'HS256'})
       .setExpirationTime('1d')
       .sign(JWT_SECRET);
   
       const response = (NextResponse.json({
           message : 'Inscrition reussie',
           user : {
               id : userId,
               username : username,
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
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
  // TODO mettre messages en anglais
}