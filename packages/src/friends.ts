import { prisma } from "./lib/prisma"
import { follow_status } from "@prisma/client"
import { PUBLIC_USER_SELECT } from "./lib/select"

// Systeme d'amis "demande + acceptation"


// Envoie une demande d'ami (status PENDING).
// Ne fait rien si une relation existe deja dans un sens ou l'autre (PENDING ou ACCEPTED).
export async function sendFriendRequest(userId: string, friendId: string): Promise<void> {
    if (userId === friendId)
        return
    const existing = await prisma.follow.findFirst({
        where: {
            OR: [
                { user_id: userId, friend_id: friendId },
                { user_id: friendId, friend_id: userId },
            ],
        },
        select: { id: true },
    })
    if (existing)
        return
    await prisma.follow.create({
        data: {
            user_id: userId,
            friend_id: friendId,
            status: follow_status.PENDING,
        },
    })
}

// Le destinataire accepte la demande recue de requesterId.
export async function acceptFriendRequest(userId: string, requesterId: string): Promise<void> {
    await prisma.follow.updateMany({
        where: {
            user_id: requesterId,
            friend_id: userId,
            status: follow_status.PENDING,
        },
        data: { status: follow_status.ACCEPTED },
    })
}

// Le destinataire refuse une demande recue (supprime la ligne PENDING).
export async function refuseFriendRequest(userId: string, requesterId: string): Promise<void> {
    await prisma.follow.deleteMany({
        where: {
            user_id: requesterId,
            friend_id: userId,
            status: follow_status.PENDING,
        },
    })
}

// L'emetteur annule une demande qu'il a envoyee.
export async function cancelFriendRequest(userId: string, friendId: string): Promise<void> {
    await prisma.follow.deleteMany({
        where: {
            user_id: userId,
            friend_id: friendId,
            status: follow_status.PENDING,
        },
    })
}

// Supprime une amitie acceptee.
export async function removeFriend(userId: string, friendId: string): Promise<void> {
    await prisma.follow.deleteMany({
        where: {
            status: follow_status.ACCEPTED,
            OR: [
                { user_id: userId, friend_id: friendId },
                { user_id: friendId, friend_id: userId },
            ],
        },
    })
}

// Liste des amis.
export async function listFriends(userId: string) {
    const rows = await prisma.follow.findMany({
        where: {
            status: follow_status.ACCEPTED,
            OR: [{ user_id: userId }, { friend_id: userId }],
        },
        include: {
            user: { select: PUBLIC_USER_SELECT },
            friend: { select: PUBLIC_USER_SELECT },
        },
    })
    return rows.map((r) => (r.user_id === userId ? r.friend : r.user))
}

// Demandes recues en attente.
export async function listPendingReceived(userId: string) {
    const rows = await prisma.follow.findMany({
        where: { friend_id: userId, status: follow_status.PENDING },
        include: { user: { select: PUBLIC_USER_SELECT } },
    })
    return rows.map((r) => r.user)
}

// Demandes envoyees en attente.
export async function listPendingSent(userId: string) {
    const rows = await prisma.follow.findMany({
        where: { user_id: userId, status: follow_status.PENDING },
        include: { friend: { select: PUBLIC_USER_SELECT } },
    })
    return rows.map((r) => r.friend)
}
