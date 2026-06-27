import argon2 from "argon2"
import crypto from "node:crypto"
import { Resend } from "resend"
import { RecoveryCodeTab } from "./user"
import { prisma } from "./prisma"

const resend = new Resend(process.env.RESEND_API_KEY!)

const MINUTES_A2F_EXPIRATION = 5;
const MAX_A2F_LOG_ATTEMPS = 5;


export async function getUserByEmail(userEmail : string) : Promise<{ userId: string | null; userUsername: string | null }>
{
	const user = await prisma.user.findUniqueOrThrow({
		where: {
			email: userEmail
		},
		select: {
			id: true,
			username: true
		}
	})
	return ({ userId: user.id, userUsername: user.username });
}

export async function verifyRecoveryCode(userEmail : string, userRecoveryCode : string) : Promise <boolean>
{
	const user = await prisma.user.findUniqueOrThrow({
		where: {
			email: userEmail
		},
		select: {
			a2f_enable: true,
			a2f_recovery_codes: true
		},
	})
	if (!user.a2f_enable || !user.a2f_recovery_codes)
		return (false);
	const recoveryCodes = JSON.parse(user.a2f_recovery_codes ?? "[]") as RecoveryCodeTab[]
	for (const r of recoveryCodes)
	{
		if (r.usedAt)
			continue ;
  		if (await argon2.verify(r.hash, userRecoveryCode))
		{
			r.usedAt = new Date().toISOString()
			await prisma.user.update({
				where: {
					email: userEmail
				},
				data: {
					a2f_recovery_codes: JSON.stringify(recoveryCodes)
				}
			})
			return (true);
		}
	}
	return (false);
}

async function sendEmailTwoFactorAuth(userEmail : string, code : string)
{
	const subject = "Verification code"
	const text = `Your verification code is:\n\n${code}\n\nIt expires in ${MINUTES_A2F_EXPIRATION} minutes.`
	const result = await resend.emails.send({
		from: process.env.RESEND_SEND_FROM!,
		to : userEmail,
		subject,
		text
	})
	return result
}

export async function verifyTwoFactorAuth(userEmail : string, userOpt : string) : Promise<boolean>
{
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email: userEmail
        },
        select: {
			a2f_enable: true,
            a2f_opt_hash: true,
            a2f_expires_at: true,
			a2f_log_attemps: true
        }
    })
	if (!user.a2f_enable)
		return (true);
	else if (!user.a2f_opt_hash || !user.a2f_expires_at)
		return (false);
    else if (user.a2f_expires_at.getTime() < Date.now())
        return (false);
	else if (user.a2f_log_attemps > MAX_A2F_LOG_ATTEMPS)
		return (false);
	if (await argon2.verify(user.a2f_opt_hash, userOpt))
    {
        await prisma.user.update({
            where: {
                email: userEmail,
            },
            data: {
				a2f_log_attemps: 0
            }
        })
		return (true);
    }
	else
	{
		await prisma.user.update({
            where: {
                email: userEmail,
            },
            data: {
				a2f_log_attemps: {increment: 1}
            }
        })
		return (false);
	}
}

export async function setTwoFactorAuth(userEmail : string) : Promise<void>
{
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email: userEmail
        },
        select: {
            a2f_enable: true
        }
    })
    if (!user.a2f_enable)
        return ;
	const code = crypto.randomInt(0, 1000000).toString()
    const hash = await argon2.hash(code)
    await sendEmailTwoFactorAuth(userEmail, code)
	await prisma.user.update({
        where: {
			email: userEmail
        },
		data: {
			a2f_opt_hash: hash,
			a2f_expires_at: new Date(Date.now() + (MINUTES_A2F_EXPIRATION * 60 * 1000))
		}
    })
	return ;
}

export async function verifyPassword(userEmail : string, password : string) : Promise<{userId : string | null; userUsername: string | null; a2fEnable: boolean}>
{
	const user = await prisma.user.findUnique({
		where: {
			email: userEmail
		},
		select: {
			id: true,
			username: true,
			password: true,
			a2f_enable: true
		},
	})
	if (!user || !user?.password)
		return ({userId: null, userUsername: null, a2fEnable: false});
	else if (!await argon2.verify(user.password, password))
		return ({userId: null, userUsername: null, a2fEnable: false});
	else
		return ({userId: user.id, userUsername: user.username, a2fEnable: user.a2f_enable});
}
