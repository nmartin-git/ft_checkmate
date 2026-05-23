import argon2 from "argon2"
import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function setTwoFactorAuth(userId : string) : Promise<void>
{
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        },
        select: {
            a2f_enable: true
        }
    })
    if (!user.a2f_enable)
        return ;
    //const secret = secret
    //recoveryCodes = codes
    return prisma.user.update({
        where: {
			id: userId
        },
		data: {
			a2f_secret: secret,
			a2f_recovery_codes: recoveryCodes
		}
    })
}

async function twoFactorAuth() : Promise<boolean>
{
	return (true);
}