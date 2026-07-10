import { addResult } from "@/src/lib/game";
import { NextResponse } from "next/server";



export async function POST(request : Request)
{
    const {gameId, result, secret} = await request.json();
    if (secret !== process.env.GAME_SERVER_SECRET)
        return new NextResponse("Not allowed",{status : 403});
    await addResult(gameId, result);
    return NextResponse.json({ok : true});
}