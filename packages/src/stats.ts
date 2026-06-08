import { prisma } from "./lib/prisma"

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

async function eloHistoric(userId : string, durationStats : number = 0)
{
	const cutoffDate = new Date();
	if (durationStats === 0)
		cutoffDate.setTime(Number.MIN_SAFE_INTEGER);
	else
		cutoffDate.setDate(cutoffDate.getDate() - durationStats);
	const games = await prisma.game.findMany({
		where: {
			OR: [{ blackUserId: userId }, { whiteUserId: userId }],
			date: {
				gte: cutoffDate
			}
		},
		select: {
			id: true,
			date: true,
			blackUserId: true,
			blackUserElo: true,
			whiteUserId: true,
			whiteUserElo: true
		},
		orderBy: {
			date: 'asc'
		}
	})
	type GameData = typeof games[0];
	return games.map((game: GameData) => ({
		id: game.id,
		date: game.date,
		elo: game.blackUserId === userId ? game.blackUserElo : game.whiteUserElo
	}));
}
