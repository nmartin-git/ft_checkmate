import { prisma } from "./prisma"

async function follow(userId : string, friendId : string)
{
    await prisma.follow.create({
        data: {
            user_id: userId,
            friend_id: friendId,
        },
    })
}

async function unfollow(userId : string, friendId : string)
{
    await prisma.follow.deleteMany({
        where: {
            user_id: userId,
            friend_id: friendId,
        },
    })
}
