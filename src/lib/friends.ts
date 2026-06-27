import { prisma } from "./prisma"
import { follow_status } from "@prisma/client"
import { PUBLIC_USER_SELECT } from "./select"

export async function sendFriendRequest(userId: string, friendId: string): Promise<void> {
    if (userId === friendId) return

    const existing = await prisma.follow.findFirst({
        where: {
            OR: [
                { user_id: userId, friend_id: friendId },
                { user_id: friendId, friend_id: userId },
            ],
        },
        select: { id: true },
    })
    
    if (existing) return

    await prisma.follow.create({
        data: {
            user_id: userId,
            friend_id: friendId,
            status: follow_status.PENDING,
        },
    })
}

export async function acceptFriendRequest(userId: string, requesterId: string): Promise<void> {
    const request = await prisma.follow.findFirst({
        where: {
            user_id: requesterId,
            friend_id: userId,
            status: follow_status.PENDING,
        },
        select: { id: true }
    })

    if (!request) throw new Error("Friend request not found")

    await prisma.follow.update({
        where: { id: request.id },
        data: { status: follow_status.ACCEPTED },
    })
}

export async function refuseFriendRequest(userId: string, requesterId: string): Promise<void> {
    const request = await prisma.follow.findFirst({
        where: {
            user_id: requesterId,
            friend_id: userId,
            status: follow_status.PENDING,
        },
        select: { id: true }
    })

    if (!request) return

    await prisma.follow.delete({
        where: { id: request.id },
    })
}

export async function findRequest(userId: string, friendId: string): Promise<boolean>
{
    const existingRequest = await prisma.follow.findFirst({
        where: {
            user_id: userId,
            friend_id: friendId,
            status: follow_status.PENDING
        }
    });
    return (Boolean(existingRequest));
}

export async function isFriends(userId: string, friendId: string): Promise<boolean>
{
    const friendship = await prisma.follow.findFirst({
        where: {
            status: follow_status.ACCEPTED,
            OR: [
                { user_id: userId, friend_id: friendId },
                { user_id: friendId, friend_id: userId },
            ]
        }
    });
    return (Boolean(friendship));
}

export async function cancelFriendRequest(userId: string, friendId: string): Promise<void> {
    const request = await prisma.follow.findFirst({
        where: {
            user_id: userId,
            friend_id: friendId,
            status: follow_status.PENDING,
        },
        select: { id: true }
    })

    if (!request) return

    await prisma.follow.delete({
        where: { id: request.id },
    })
}

export async function removeFriend(userId: string, friendId: string): Promise<void> {
    const friendship = await prisma.follow.findFirst({
        where: {
            status: follow_status.ACCEPTED,
            OR: [
                { user_id: userId, friend_id: friendId },
                { user_id: friendId, friend_id: userId },
            ],
        },
        select: { id: true }
    })

    if (!friendship) return

    await prisma.follow.delete({
        where: { id: friendship.id },
    })
}

export async function listFriends(userId: string) {
    const rows = await prisma.follow.findMany({
        where: {
            status: follow_status.ACCEPTED,
            OR: [{ user_id: userId }, { friend_id: userId }],
        },
        select: {
            user_id: true,
            user: { select: PUBLIC_USER_SELECT },
            friend: { select: PUBLIC_USER_SELECT },
        },
    })
    return rows.map((r) => (r.user_id === userId ? r.friend : r.user))
}

export async function getFriendsCount(userId: string) : Promise<number>
{
    const friendsCount = await prisma.follow.count({
        where: {
            OR: [{ user_id: userId }, { friend_id: userId }],
            status: follow_status.ACCEPTED
        }
    })
    return (friendsCount);
}

export async function getFriendsList(userId: string)
{
    const rows = await prisma.follow.findMany({
        where: {
            status: follow_status.ACCEPTED,
            OR: [
                { user_id: userId }, 
                { friend_id: userId }
            ],
        },
        select: {
            user_id: true,
            friend_id: true,
            user: { select: PUBLIC_USER_SELECT },
            friend: { select: PUBLIC_USER_SELECT },
        }
    });

    return rows.map((r) => {
        const targetUser = r.user_id === userId ? r.friend : r.user;
        const targetId = r.user_id === userId ? r.friend_id : r.user_id;

        return {
            ...targetUser,
            id: targetId
        };
    });
}

export async function listPendingReceived(userId: string) {
    return prisma.follow.findMany({
        where: { friend_id: userId, status: follow_status.PENDING },
        select: { user: { select: PUBLIC_USER_SELECT } },
    }).then(rows => rows.map(r => r.user))
}
