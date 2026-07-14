import { prisma } from "./prisma"
import { PUBLIC_USER_SELECT } from "./select"
import { getUserById } from "./user"

const MAX_MESSAGE_LENGTH = 140
const CONVERSATION_PAGE_SIZE = 50

export async function getChatEnable(userId: string) : Promise<boolean>
{
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        },
        select: {
            chat_enable: true,
        }
    })
    return (user.chat_enable);
}

export async function loadDiscussion(currentUserId: string, targetUserId: string)
{
    const [initialMessages, partnerUser, chatEnable] = await Promise.all([
            getConversation(currentUserId, targetUserId),
			getUserById(targetUserId),
            getChatEnable(currentUserId),
        ]);
    await markConversationRead(currentUserId, targetUserId);
    return { initialMessages, partnerUser, chatEnable};
}

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

export async function listConversations(userId: string) {
    const sentTo = await prisma.directMessage.findMany({
        where: { sender_id: userId },
        distinct: ['receiver_id'],
        select: { receiver_id: true }
    });
    
    const receivedFrom = await prisma.directMessage.findMany({
        where: { receiver_id: userId },
        distinct: ['sender_id'],
        select: { sender_id: true }
    });

    const partnerIds = Array.from(new Set([
        ...sentTo.map(m => m.receiver_id),
        ...receivedFrom.map(m => m.sender_id)
    ]));

    const conversationPromises = partnerIds.map(async (partnerId) => {
        const [lastMessage, unreadCount, partnerUser] = await Promise.all([
            prisma.directMessage.findFirst({
                where: {
                    OR: [
                        { sender_id: userId, receiver_id: partnerId },
                        { sender_id: partnerId, receiver_id: userId }
                    ]
                },
                orderBy: { date: 'desc' }
            }),
            prisma.directMessage.count({
                where: {
                    sender_id: partnerId,
                    receiver_id: userId,
                    read_at: null
                }
            }),
            prisma.user.findUnique({
                where: { id: partnerId },
                select: PUBLIC_USER_SELECT
            })
        ]);

        return {
            partner: partnerUser,
            lastMessage,
            unreadCount
        };
    });

    const results = await Promise.all(conversationPromises);
    
    return results
        .filter(r => r.lastMessage !== null && r.partner !== null)
        .sort((a, b) => b.lastMessage!.date.getTime() - a.lastMessage!.date.getTime());
}

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
