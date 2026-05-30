import {prisma} from '@/lib/prisma';
import * as argon2 from 'argon2';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req : NextRequest)
{
    try {
        const {email, password} = await req.json();
        if (!email || !password){
            return (NextResponse.json({error: 'Please enter email and password'},
                {status : 400}
            ));
        }
        const user = await prisma.user.findUnique({
            where : {email:email}
        });
        if (!user){
            return (NextResponse.json({error: 'Email or Password incorrect'},
                {status : 401}
            ));
        }
        const isPasswordValid = await argon2.verify(user.password, password);
        if (!isPasswordValid){
            return (NextResponse.json({error: 'Email or password incorrect'},
                {status : 401}
            ));
        }
        return (NextResponse.json({
            message : 'Connexion reussie',
            user : {
                id : user.id,
                username : user.username,
                email:user.email
            },
            status : 200
                }            
            ));
    } catch (error) {
        console.error('Erreur lors du login', error);
        return NextResponse.json({
            error: "Erreur Server",
            status : 500
        });       
    }
}