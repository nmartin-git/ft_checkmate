import argon2 from "argon2"
import crypto from "node:crypto"
import { unlink } from "node:fs/promises"
import { join } from "node:path"
import { prisma } from "./prisma"
import { Prisma, club_names } from "@prisma/client"
import { setTwoFactorAuth } from "./auth"

const RECOVERY_CODES_NUMBER = 10;
const RECOVERY_CODES_LENGTH = 10;
const DEFAULT_AVATAR_URL = "url";
const CHAT_AGE_LIMIT = 16;

type UserUpdateFields = Partial<{
	birthdate: Date | null 
	is_premium: boolean
	is_admin: boolean
	elo: number
	is_online: boolean
}>

export type RecoveryCodeTab = {
	hash: string
	usedAt: string | null
}

export async function updateUserField(userId : string, data : UserUpdateFields) : Promise <void>
{
    await prisma.user.update({
		where: {
			id: userId
		},
        data,
    })
}

function isAtLeastAge(birthdate: Date | null, age = CHAT_AGE_LIMIT, now = new Date()) : boolean
{
	if (!birthdate)
		return (false);
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	const birthdayThisAge = new Date(
		birthdate.getFullYear() + age,
		birthdate.getMonth(),
		birthdate.getDate()
	)
  return (today >= birthdayThisAge);
}

export async function updateChatEnable(userId : string, enable : boolean) : Promise <void>
{
	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id: userId
		},
		select: {
			birthdate: true,
			chat_enable: true
		}
	})
	if (user.chat_enable === enable)
		return ;
	else if (enable)
	{
		if (!isAtLeastAge(user.birthdate))
			return ;
		await prisma.user.update({
			where: {
				id: userId
			},
			data: {
				chat_enable: true
			}
		})
	}
	else
	{
		await prisma.user.update({
			where: {
				id: userId
			},
			data: {
				chat_enable: false
			}
		})
	}
}

// Met à jour l'avatar. Supprime l'ancien fichier UNIQUEMENT s'il s'agit
// d'un upload personnel (/uploads/...), jamais un avatar par défaut (/avatars/...).
export async function updateAvatar(userId : string, newUrl : string | null) : Promise <void>
{
	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id: userId
		},
		select: {
			avatar_url: true,
		}
	})
	if (user.avatar_url && user.avatar_url.startsWith("/uploads/")) {
		try {
			await unlink(join(process.cwd(), "public", user.avatar_url))
		} catch {
			// fichier déjà absent : on ignore, ce n'est pas bloquant
		}
	}
	await prisma.user.update({
		where: {
			id: userId
		},
		data: {
			avatar_url: newUrl
		}
	})
}

async function getAvatar(userId : string) : Promise <string>
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

export async function getParameters(userId : string)
{
	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id: userId
		},
		select: {
			avatar_url: true,
			chat_enable: true,
			a2f_enable: true,
			birthdate: true
		}
	})
	return ({avatar: user.avatar_url, chatEnable: user.chat_enable, twoFactorAuthEnable: user.a2f_enable, birthdate: user.birthdate});
}

export async function getProfile(userId : string)
{
	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id: userId
		},
		select: {
			username: true,
			email: true,
			club: true,
			elo: true,
			avatar_url: true
		}
	})
	return (user);
}

export async function searchPlayer(userId: string, query: string)
{
	const users = await prisma.user.findMany({
        where: {
            username: {
                contains: query,
                mode: 'insensitive'
            },
            NOT: {
                id: userId
            }
        },
        select: {
            id: true,
            username: true
        },
        take: 10
    });
	return (users);
}

async function generateRecoveryCodes(userId : string) : Promise <string []>
{
	const rawRecoveryCodes: string[] = []
	const recoveryCodes: RecoveryCodeTab [] = []
	for (let i = 0; i < RECOVERY_CODES_NUMBER; i++)
	{
		const code = crypto.randomBytes(RECOVERY_CODES_LENGTH).toString("hex")
		const codeHash = await argon2.hash(code)
		rawRecoveryCodes.push(code)
		recoveryCodes.push({hash: codeHash, usedAt: null})
	}
	await prisma.user.update({
		where: {
			id: userId
		},
		data: {
			a2f_recovery_codes: JSON.stringify(recoveryCodes)
		}
	})
	return (rawRecoveryCodes);
}

export async function updateTwoFactorAuth(userId : string, enable : boolean) : Promise <string [] | null>
{
	let recoveryCodes = null
	if (enable)
		recoveryCodes = await generateRecoveryCodes(userId)
	await prisma.user.update({
		where: {
			id: userId
		},
        data: {
			a2f_enable: enable
		}
    })
	return (recoveryCodes);
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

export async function inscriptionClassic(inputEmail : string, inputUsername : string, inputPassword : string | null) : Promise<string | null>
{
	const user = await prisma.user.findFirst({
		where: {
			OR: [ { email: inputEmail} , { username: inputUsername}]
		},
		select: {
			id : true
		},
	})
	if (user)
		return (null);
	let hash: string | null;
	if (inputPassword)
		hash = await argon2.hash(inputPassword)
	else
		hash = null
	const clubs = Object.values(club_names)
	try {
		const newUser = await prisma.user.create({
			data: {
				email: inputEmail,
				username: inputUsername,
				password: hash,
				club: clubs[Math.floor(Math.random() * clubs.length)],
			},
			select: {
				id: true
			}
		})
		return (newUser.id);
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2002') {
				const targets = error.meta?.target as string[];
				if (targets?.includes('email')) {
                	console.log("Collision détectée sur l'email");
           		}
            	if (targets?.includes('username')) {
              		console.log("Collision détectée sur le username");
            	}
				return (null);
			}
		}
		throw error;
	}
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

// export async function deleteAccount(userId: string): Promise<void> {
// 	await prisma.$transaction(async (tx) => {
// 		const games = await tx.game.findMany({
// 			where: { OR: [{ white_player_id: userId }, { black_player_id: userId }] },
// 			select: { id: true },
// 		});
// 		const gameIds = games.map((g) => g.id);

// 		if (gameIds.length > 0) {
// 			await tx.move.deleteMany({ where: { game_id: { in: gameIds } } });
// 			await tx.directMessage.deleteMany({ where: { game_id: { in: gameIds } } });
// 		}
// 		await tx.directMessage.deleteMany({ where: { author_user_id: userId } });

// 		await tx.directMessage.deleteMany({
// 			where: { OR: [{ sender_id: userId }, { receiver_id: userId }] },
// 		});

// 		await tx.friends.deleteMany({
// 			where: { OR: [{ user_id: userId }, { friend_id: userId }] },
// 		});

// 		if (gameIds.length > 0) {
// 			await tx.game.deleteMany({ where: { id: { in: gameIds } } });
// 		}

// 		await tx.user.delete({ where: { id: userId } });
// 	});
// }