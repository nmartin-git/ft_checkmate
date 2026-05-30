import argon2 from "argon2"
import crypto from "node:crypto"
import { Resend } from "resend"
import { RecoveryCodeTab } from "./user"
import { prisma } from "./lib/prisma"

const resend = new Resend(process.env.RESEND_API_KEY!)

const MINUTES_A2F_EXPIRATION = 5;
const MAX_A2F_LOG_ATTEMPS = 5;


async function sendEmailTwoFactorAuth(userEmail : string, code : string)
{
	const subject = "Votre code 2FA"
	const text = `Votre code 2FA est:\n\n${code}\n\nIl expire dans ${MINUTES_A2F_EXPIRATION} minutes.`
	const result = await resend.emails.send({
		from: process.env.RESEND_MAIL_FROM!,
		to : userEmail,
		subject,
		text
	})
	return result
}

async function setTwoFactorAuth(userEmail : string) : Promise<void>
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
    const hash = await argon2.hash(crypto.randomInt(0, 1000000).toString())
    //TODO send mail
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

async function verifyTwoFactorAuth(userEmail : string, userOpt : string) : Promise<boolean>
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
    else if (user.a2f_expires_at.getTime() > Date.now())
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

async function verifyRecoveryCode(userEmail : string, userRecoveryCode : string) : Promise <boolean>
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

async function verifyPassword(userEmail : string, password : string) : Promise<boolean>
{
	const user = await prisma.user.findUniqueOrThrow({
		where: {
			email: userEmail
		},
		select: {
			password: true,
			a2f_enable: true
		},
	})
	if (!user?.password)
		return (false);
	if (!await argon2.verify(user.password, password))
		return (false);
	if (user.a2f_enable)
	{
		await setTwoFactorAuth(userEmail)
		// return (verifyTwoFactorAuth(userEmail, input));//TODO: check 2FA
		return (false);
	}
	else
		return (true);
}