import { NextRequest, NextResponse } from 'next/server';
import { inscriptionClassic } from '@/src/lib/user';


export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Tous les champs sont obligatoires' },
        { status: 400 }
      );
    }
    const userId = await inscriptionClassic(email, username, password)
    if (!userId) {
      return NextResponse.json(
        { error: 'Cet email ou nom d\'utilisateur existe déjà' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        message: 'Utilisateur créé avec succès',
        user: {
          id: userId,
          username: username,
          email: email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
  // TODO mettre messages en anglais
}