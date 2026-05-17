import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
    const user = await prisma.user.create({
        data: {
            email: "mailll",
            club: "N"
        },
    })
    console.log(user)
}

main()
    .catch(e => {
        console.error(e.message)
    })
    .finally(async() => {
        await prisma.$disconnect()
    })