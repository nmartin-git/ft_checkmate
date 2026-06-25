import { NextResponse } from "next/server";
import useCurrentUser from "@/src/hooks/useCurrentUser";
import { searchPlayer } from "@/src/lib/user";

export async function GET(request: Request) {
    try {
        const user = useCurrentUser();
        if (!user || !user.user) {
            return new NextResponse("Non autorisé", { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        if (!query || query.trim() === "") {
            return NextResponse.json([]);
        }
        return NextResponse.json(searchPlayer(user.user.id, query));
    } catch (error) {
        console.error("[USERS_SEARCH_ERROR]", error);
        return new NextResponse("Erreur Interne", { status: 500 });
    }
}