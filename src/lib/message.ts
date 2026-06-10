import { prisma } from "./prisma"
import { PUBLIC_USER_SELECT } from "./select"

// Messagerie directe entre les utilisateurs

const MAX_MESSAGE_LENGTH = 140
const CONVERSATION_PAGE_SIZE = 50

// Envoie un message direct.
// L'expediteur doit avoir le chat active.
export async function sendDirectMessage(senderId: string, receiverId: string, rawMessage: string) {
    if (senderId === receiverId)
        throw new Error("Cannot send a message to yourself")
    const message = rawMessage.trim()
    if (!message)
        throw new Error("Message is empty")
    if (message.length > MAX_MESSAGE_LENGTH)
        throw new Error(`Message exceeds ${MAX_MESSAGE_LENGTH} characters`)
    const sender = await prisma.user.findUniqueOrThrow({
        where: { id: senderId },
        select: { chat_enable: true },
    })
    if (!sender.chat_enable)
        throw new Error("Chat is disabled for this user")
    return prisma.directMessage.create({
        data: {
            sender_id: senderId,
            receiver_id: receiverId,
            message,
        },
    })
}

// Recupere une conversation entre deux users, dans l'ordre chronologique.
export async function getConversation(
    userId: string,
    otherId: string,
    take = CONVERSATION_PAGE_SIZE,
    before?: Date,
) {
    const rows = await prisma.directMessage.findMany({
        where: {
            OR: [
                { sender_id: userId, receiver_id: otherId },
                { sender_id: otherId, receiver_id: userId },
            ],
            ...(before ? { date: { lt: before } } : {}),
        },
        orderBy: { date: "desc" },
        take,
    })
    return rows.reverse()
}

// Liste des conversations : pour chaque interlocuteur, le dernier message et le
// nombre de messages recus non lus.
export async function listConversations(userId: string) {
    const messages = await prisma.directMessage.findMany({
        where: {
            OR: [{ sender_id: userId }, { receiver_id: userId }],
        },
        orderBy: { date: "desc" },
        include: {
            sender: { select: PUBLIC_USER_SELECT },
            receiver: { select: PUBLIC_USER_SELECT },
        },
    })
    const conversations = new Map<
        string,
        { partner: (typeof messages)[number]["sender"]; lastMessage: (typeof messages)[number]; unreadCount: number }
    >()
    for (const m of messages) {
        const partner = m.sender_id === userId ? m.receiver : m.sender
        let conv = conversations.get(partner.id)
        if (!conv) {
            conv = { partner, lastMessage: m, unreadCount: 0 }
            conversations.set(partner.id, conv)
        }
        if (m.receiver_id === userId && m.read_at === null)
            conv.unreadCount++
    }
    return Array.from(conversations.values())
}

// Marque comme lus les messages recus.
export async function markConversationRead(userId: string, otherId: string): Promise<void> {
    await prisma.directMessage.updateMany({
        where: {
            sender_id: otherId,
            receiver_id: userId,
            read_at: null,
        },
        data: { read_at: new Date() },
    })
}
