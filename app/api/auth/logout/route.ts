import { NextRequest, NextResponse } from "next/server";

export async function POST(request : NextRequest)
{
    try {
        const response = NextResponse.json({
            message: "Logout done!",
            status : 200
        });
        response.cookies.set('auth-token','',{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:'lax',
            expires:new Date(0),
            path:'/'
        });
        return response;
    } catch (error) {
        console.error('logout problem',error );
        return NextResponse.json({
            error: "erreur serveur",
            status: 500
        });
        
    }
}