import argon2 from "argon2"
import "dotenv/config"
import { club_names, PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

type UserUpdateFields = Partial<{
	birthdate: Date | null
	chat_enable: boolean
	is_premium: boolean
	is_admin: boolean
	elo: number
	is_online: boolean
}>

async function updateUserField(userId : string, data : UserUpdateFields) : Promise <void>
{
    await prisma.user.update({
		where: {
			id: userId
		},
        data,
    })
}

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

async function changePassword(userId : string, password : string) : Promise <void>
{
    const hash = await argon2.hash(password)
    await prisma.user.update({
		where: {
			id: userId
		},
        data: {
            password: hash
        },
    })
}

async function verifyPassword(userEmail : string, password : string) : Promise<boolean>
{
	const user = await prisma.user.findUnique({
		where: {
			email: userEmail
		},
		select: {
			password: true
		},
	})
	if (!user?.password)
		return (false)
	return (argon2.verify(user.password, password))
}

async function inscriptionClassic(inputEmail : string, inputUsername : string, inputPassword : string) : Promise<void>
{
	const user = await prisma.user.findUnique({
		where: {
			email: inputEmail
		},
		select: {
			id : true
		},
	})
	if (user)
		return
	const hash = await argon2.hash(inputPassword)
	const clubs = Object.values(club_names)
	await prisma.user.create({
		data: {
			email: inputEmail,
			username: inputUsername,
			password: hash,
			club: clubs[Math.floor(Math.random() * clubs.length)],
		},
	})
}

// async function main() {
// 	await inscriptionClassic("test@mail1", "gahrp", "mdp1")
// 	await inscriptionClassic("test@mail2", "ihhhhh", "mdp2")
// 	await inscriptionClassic("test@mail3", "gazo", "mdp3")
//     const result1 = await verifyPassword("test@mail2", "mdp1")
//     const result2 = await verifyPassword("test@mail2", "mdp2")
// 	if (result1)
// 		console.log("success")
// 	else
// 		console.log("fail")
// 	if (result2)
// 		console.log("success2")
// 	else
// 		console.log("fail2")
// }

// main()
//     .catch(e => {
//         console.error(e.message)
//     })
//     .finally(async() => {
//         await prisma.$disconnect()
//     })