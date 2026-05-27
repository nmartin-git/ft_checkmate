import { prisma } from "@/lib/prisma"

async function getStats(userId : string)
{
    const rows = await prisma.game.groupBy({
        by: ["result"],
        where: {
            id: userId
        },
        _count: { _all: true },
    })
    const stats = { WIN: 0, LOSS: 0, DRAW: 0 }
    for (const r of rows)
        stats[r.result as "WIN" | "LOSS" | "DRAW"] = r._count._all
	const totalGames = stats.WIN + stats.LOSS + stats.DRAW
	let winRate : number
	if (totalGames)
		winRate = stats.WIN / totalGames
	else
		winRate = 0
}

async function eloStats(userId : string)
{
	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id: userId
		},
		select: {
			elo: true
		}
	})
	
}
