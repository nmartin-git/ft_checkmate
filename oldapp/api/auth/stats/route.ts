import { eloHistoric, getStats } from "@/src/lib/stats";
import { NextRequest, NextResponse } from "next/server";



export async function GET(req : NextRequest, userId : string)
{
    const [stats, eloHistory] = await Promise.all([
        getStats(userId),
        eloHistoric(userId)
    ]);
    return NextResponse.json({stats,eloHistory});
}