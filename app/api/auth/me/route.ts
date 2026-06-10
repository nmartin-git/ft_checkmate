import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";


const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'secret-a-changer'
);

export async function GET()
{
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;
        if (!token)
            return NextResponse.json({user:null},{status : 401});
        const {payload} = await jwtVerify(token, JWT_SECRET);
        return (NextResponse.json({
            user: {
                id : payload.id,
                username:payload.username,
                email: payload.email
            }
        }));
    } catch  {
        const response = NextResponse.json({user:null},{status:401});
        return response;
    }
}