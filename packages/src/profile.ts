import { prisma } from "./lib/prisma"
import { follow_status } from "@prisma/client"
import { PUBLIC_USER_SELECT } from "./lib/select"

// Profil public d'un utilisateur, consultable par les autres.

const HISTORY_SIZE = 20

// Retourne les infos publiques d'un user, son nombre d'amis et
// son historique de parties recentes. Renvoie null si l'utilisateur n'existe pas.
export async function getPublicProfile(username: string) {
    const user = await prisma.user.findUnique({
        where: { username },
        select: {
            ...PUBLIC_USER_SELECT,
            is_premium: true,
        },
    })
    if (!user)
        return null
    const [friendCount, games] = await Promise.all([
        prisma.follow.count({
            where: {
                status: follow_status.ACCEPTED,
                OR: [{ user_id: user.id }, { friend_id: user.id }],
            },
        }),
        prisma.game.findMany({
            where: {
                OR: [{ white_player_id: user.id }, { black_player_id: user.id }],
            },
            orderBy: { date: "desc" },
            take: HISTORY_SIZE,
            select: {
                id: true,
                date: true,
                result: true,
                white_player_elo: true,
                black_player_elo: true,
                white_user: { select: { id: true, username: true, avatar_url: true } },
                black_user: { select: { id: true, username: true, avatar_url: true } },
            },
        }),
    ])
    return { ...user, friendCount, games }
}
