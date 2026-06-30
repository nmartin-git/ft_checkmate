import { prisma } from "./prisma"
import { game_results, follow_status } from "@prisma/client"
import { PUBLIC_USER_SELECT } from "./select"

export async function openGameRequest(userId: string, friendId: string): Promise<void>
{
	await prisma.friends.updateMany({
    	where: {
    	    OR: [
    	        { user_id: userId, friend_id: friendId },
    	        { user_id: friendId, friend_id: userId }
    	    ],
    	    status: follow_status.ACCEPTED
    	},
    	data: {
    	    user_id: userId,
    	    friend_id: friendId,
    	    status: follow_status.GAME_REQUESTED
    	}
	})
}

export async function closeGameRequest(userId: string, friendId: string): Promise<void>
{
	await prisma.friends.updateMany({
    	where: {
    	    OR: [
    	        { user_id: userId, friend_id: friendId },
    	        { user_id: friendId, friend_id: userId }
    	    ],
    	    status: follow_status.GAME_REQUESTED
    	},
    	data: {
    	    status: follow_status.PENDING
    	}
	})
}

export async function refuseGameRequest(userId: string, friendId: string): Promise<void>
{
	await prisma.friends.updateMany({
    	where: {
    	    OR: [
    	        { user_id: userId, friend_id: friendId },
    	        { user_id: friendId, friend_id: userId }
    	    ],
    	    status: follow_status.GAME_REQUESTED
    	},
    	data: {
    	    status: follow_status.REFUSED
    	}
	})
}

export async function AcceptGameRequest(userId: string, friendId: string): Promise<void>
{
	await prisma.friends.updateMany({
    	where: {
    	    OR: [
    	        { user_id: userId, friend_id: friendId },
    	        { user_id: friendId, friend_id: userId }
    	    ],
    	    status: follow_status.GAME_REQUESTED
    	},
    	data: {
    	    status: follow_status.ACCEPTED
    	}
	})
}

export async function isGameRequested(userId: string): Promise<Boolean>
{
	const existingRequest = await prisma.friends.findFirst({
    	where: {
     	   user_id: userId,
      	  status: follow_status.GAME_REQUESTED
    	}
	})
	return (Boolean(existingRequest));
}

export async function isGameRequestedBis(userId: string, friendId: string): Promise<Boolean>
{
	const existingRequest = await prisma.friends.findFirst({
        where: {
            user_id: userId,
            friend_id: friendId,
            status: follow_status.GAME_REQUESTED
        }
    });
	return (Boolean(existingRequest));
}

export async function isActiveRequest(userId: string, friendId: string)
{
	const activeRequests = await prisma.friends.findMany({
        where: {
            status: follow_status.GAME_REQUESTED,
            OR: [{ user_id: userId }, { friend_id: friendId }]
        },
        select: {
            user_id: true,
            friend_id: true
        }
    });
	return (activeRequests);
}

async function addMove(gameId : string, initialPos: number, newPos : number, timeToMove : number)
{
	return prisma.$transaction(async (tx) => {
		const last = await tx.move.findFirst({
			where: {
				game_id: gameId
			},
			orderBy: {
				move_number: "desc"
			},
			select: {
				move_number: true
			}
		})
		const moveNumber = (last?.move_number ?? 0) + 1
		return tx.move.create({
			data: {
				game_id: gameId,
				move_number: moveNumber,
				initial_position: initialPos,
				new_position: newPos,
				time_to_move: timeToMove
			}
		})
	})
}

export async function listPendingGameReceived(userId: string)
{
	const rows = await prisma.friends.findMany({
		where: {
			friend_id: userId,
			status: follow_status.GAME_REQUESTED
		},
		select: {
			user: { select: PUBLIC_USER_SELECT }
		}
	})
	return (rows.map((r) => (r.user)));
}


export async function newGame(whitePlayerId : string, blackPlayerId : string)
{
	if (whitePlayerId === blackPlayerId)
		throw new Error("You can't play against yourself !");
	const whitePlayer = await prisma.user.findUniqueOrThrow({
		where: {
			id: whitePlayerId
		},
		select: {
			elo: true
		}
	})
	const blackPlayer = await prisma.user.findUniqueOrThrow({
		where: {
			id: blackPlayerId
		},
		select: {
			elo: true
		}
	})
	const game = await prisma.game.create({
		data: {
			white_player_id: whitePlayerId,
			black_player_id: blackPlayerId,
			white_player_elo: whitePlayer.elo,
			black_player_elo: blackPlayer.elo
		},
	})
	return game;
}

function eloMultiplier(whiteElo : number, blackElo : number)
{
	return (1 / (1 + Math.pow(10, (blackElo - whiteElo) / 400)));
}

function eloCalculator(whiteElo : number, blackElo : number, result : game_results)
{
	const constantMultiplier = 20;
	const whiteMultiplier = eloMultiplier(whiteElo, blackElo);
	const blackMultiplier = 1 - whiteMultiplier;
	let whiteScore: 0 | 0.5 | 1;
	if (result === "WHITE")
		whiteScore = 1;
	else if (result === "BLACK")
		whiteScore = 0;
	else
		whiteScore = 0.5;
	const blackScore = (1 - whiteScore) as 0 | 0.5 | 1;
	const whiteNewElo = whiteElo + constantMultiplier * (whiteScore - whiteMultiplier);
	const blackNewElo = blackElo + constantMultiplier * (blackScore - blackMultiplier);
	return {
		whiteElo: Math.max(0, Math.round(whiteNewElo)),
		blackElo: Math.max(0, Math.round(blackNewElo))
	}
}

async function addResult(gameId : string, gameResult : game_results)
{
	const game = await prisma.game.findUniqueOrThrow({
		where: {
			id: gameId
		},
		select: {
			white_user: {select: { id: true, elo: true} },
			black_user: {select: { id: true, elo: true} },
			result: true
		}
	})
	const { whiteElo: whiteNewElo, blackElo: blackNewElo } =
		eloCalculator(game.white_user.elo, game.black_user.elo, gameResult);
	await prisma.$transaction([
		prisma.game.updateMany({
			where: {
				id: gameId
			},
			data: {
				result: gameResult
			},
		}),
		prisma.user.update({
			where: {
				id: game.white_user.id
			},
			data: {
				elo: whiteNewElo
			},
		}),
		prisma.user.update({
			where: {
				id: game.black_user.id
			},
			data: {
				elo: blackNewElo
			},
		})
	])
}