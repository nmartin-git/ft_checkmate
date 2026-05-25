import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

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
