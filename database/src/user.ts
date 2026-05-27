import argon2 from "argon2"
import crypto from "node:crypto"
import { unlink } from "node:fs/promises"
import { prisma } from "@/lib/prisma"

const RECOVERY_CODES_NUMBER = 10;
const RECOVERY_CODES_LENGTH = 10;
const DEFAULT_AVATAR_URL = "url";

type UserUpdateFields = Partial<{
	birthdate: Date | null
	chat_enable: boolean
	is_premium: boolean
	is_admin: boolean
	elo: number
	is_online: boolean
}>

export type RecoveryCodeTab = {
	hash: string
	usedAt: string | null
}

async function updateUserField(userId : string, data : UserUpdateFields) : Promise <void>
{
    await prisma.user.update({
		where: {
			id: userId
		},
        data,
    })
}

async function generateRecoveryCodes(userId : string) : Promise <void>
{
	const rawRecoveryCodes: string[] = []
	const recoveryCodes: RecoveryCodeTab [] = []
	for (let i = 0; i++; i < RECOVERY_CODES_NUMBER)
	{
		const code = crypto.randomBytes(RECOVERY_CODES_LENGTH).toString("hex")
		const codeHash = await argon2.hash(code)
		rawRecoveryCodes.push(code)
		recoveryCodes.push({hash: codeHash, usedAt: null})
	}
	// TODO afficher sur l'ecran les codes de rawRecoveryCodes
	await prisma.user.update({
		where: {
			id: userId
		},
		data: {
			a2f_recovery_codes: JSON.stringify(recoveryCodes)
		}
	})
}

async function updateAvatar(userId : string, newUrl : string | null)
{
	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id: userId
		},
		select: {
			avatar_url: true
		}
	})
	if (user.avatar_url)
		await unlink(user.avatar_url)
	await prisma.user.update({
		where: {
			id: userId
		},
		data: {
			avatar_url: newUrl
		}
	})
}

async function getAvatar(userId : string)
{
	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id: userId
		},
		select: {
			avatar_url: true
		}
	})
	return (user.avatar_url ?? DEFAULT_AVATAR_URL);
}

async function updateTwoFactorAuth(userId : string, enable : boolean) : Promise <void>
{
	let recoveryCodes
	if (enable)
		recoveryCodes = await generateRecoveryCodes(userId)
	else
		recoveryCodes = null
	await prisma.user.update({
		where: {
			id: userId
		},
        data: {
			a2f_enable: enable,
			a2f_recovery_codes: recoveryCodes
		}
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