import "dotenv/config"
import { game_results, PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function newGame(whitePlayerId : string, blackPlayerId : string)
{
	const whitePlayer = await prisma.user.findUnique({
		where: {
			id: whitePlayerId
		},
		select: {
			elo: true
		}
	})
	const blackPlayer = await prisma.user.findUnique({
		where: {
			id: blackPlayerId
		},
		select: {
			elo: true
		}
	})
	await prisma.game.create({
		data: {
			white_player_id: whitePlayerId,
			black_player_id: blackPlayerId,
			white_player_elo: whitePlayer.elo,
			black_player_elo: blackPlayer.elo
		},
	})
}

async function addResult(gameId : string, gameResult : game_results)
{
	const game = await prisma.game.findUnique({
		where: {
			id: gameId
		},
		select: {
			white_player_id: true,
			black_player_id: true
		}
	})
	const whitePlayer = await prisma.user.findUnique({
		where: {
			id: game.white_player_id
		},
		select: {
			elo: true
		}
	})
	const blackPlayer = await prisma.user.findUnique({
		where: {
			id: game.black_player_id
		},
		select: {
			elo: true
		}
	})
	//handle elo algorythm
	await prisma.game.update({
		where: {
			id: gameId
		},
		data: {
			result: gameResult
		},
	})
	await prisma.user.update({
		where: {
			id: whitePlayer.id
		},
		data: {
			elo: elo//result
		},
	})
	await prisma.user.update({
		where: {
			id: blackPlayer.id
		},
		data: {
			elo: elo//result
		},
	})
}