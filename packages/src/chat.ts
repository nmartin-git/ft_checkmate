import { prisma } from "./lib/prisma"
import { assertClean } from "./moderation"

// Chat de partie
const MAX_MESSAGE_LENGTH = 140

// Envoie un message dans le chat d'une partie. Bloque le contenu inapproprie.
export async function sendGameMessage(authorId: string, gameId: string, rawMessage: string) {
    const message = rawMessage.trim()
    if (!message)
        throw new Error("Message is empty")
    if (message.length > MAX_MESSAGE_LENGTH)
        throw new Error(`Message exceeds ${MAX_MESSAGE_LENGTH} characters`)
    assertClean(message) // moderation : rejette le message si interdit
    return prisma.chat.create({
        data: {
            author_user_id: authorId,
            game_id: gameId,
            message,
        },
    })
}

// Lit les messages d'une partie.
export async function getGameMessages(gameId: string, take = 50) {
    return prisma.chat.findMany({
        where: { game_id: gameId },
        orderBy: { date: "asc" },
        take,
        include: {
            author_user: { select: { id: true, username: true, avatar_url: true } },
        },
    })
}
