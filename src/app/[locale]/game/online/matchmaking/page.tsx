import { getFriendsList } from "@/src/lib/friends";
import { getTranslations } from "next-intl/server";
import MatchmakingClientView from "@/src/components/MatchmakingClientView";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET || 'secret-a-changer'
);

interface TokenPayload {
	id: string;
	username: string;
	email: string;
}

export default async function FriendsdPage() {
    const t = await getTranslations("errors");
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get('auth-token')?.value;

		if (!token) {
			return <p className="text-white text-center mt-10">{t("not_connected")}</p>;
		}
		const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET);
		if (!payload || !payload.id) {
			return <p className="text-white text-center mt-10">{t("invalid_session")}</p>;
		}
		return <MatchmakingClientView friendsList={await getFriendsList(payload.id)} />
	} catch (error) {
		console.error("Erreur de session serveur:", error);
		return <p className="text-white text-center mt-10">{t("profile_load_error")}</p>;
	}
}