import { prisma } from "./prisma"


export async function getRecentMatches(userID: string, limit:number =3){
	const games = await prisma.game.findMany({
		where :{
			OR : [{white_player_id:userID},{black_player_id:userID}],
			result :{not:null}
		},
		select : {
			id:true,
			date:true,
			result:true,
			white_player_id:true,
			white_player_elo:true,
			black_player_elo:true,
			white_user : {select:{username:true}},
			black_user : {select: {username:true}}
		},
		orderBy: {date:'desc'},
		take:limit
	});
	return games.map((g)=>{
		const isWhite = g.white_player_id === userID;
		const opponent = isWhite ? g.black_user.username : g.white_user.username;
		let outcome : 'WIN' | 'LOSS' | 'DRAW';
		if (g.result === 'DRAW') outcome = 'DRAW';
		else if (g.result === 'WHITE') outcome = isWhite ? 'WIN' : 'LOSS';
		else outcome = isWhite ? 'LOSS' : 'WIN';
		return {
			id : g.id,
			date : g.date,
			opponent,
			outcome,
			color : (isWhite ? 'white' : 'black') as 'white' | 'black',
			myElo : isWhite ? g.white_player_elo : g.black_player_elo
		};

	});
}

export async function getStats(userId : string)
{
    const games = await prisma.game.findMany({
        where: {
            OR: [{ white_player_id: userId },{ black_player_id: userId }]
        },
        select: {
        	result: true,
        	white_player_id: true
    	}
    })
	let wins = 0
	let losses = 0
	let draws = 0
	for (const g of games)
	{
        if (g.result === "DRAW")
			draws++
		else if (g.result === "WHITE")
			g.white_player_id === userId ? wins++ : losses++
		else if (g.result === "BLACK")
			g.white_player_id === userId ? losses++ : wins++
	}
	const totalGames = wins + losses + draws
	let winRate : number
	if (totalGames)
		winRate = wins / totalGames
	else
		winRate = 0
	return { winrate: winRate, wins: wins, losses: losses, draws: draws}
}

export async function eloHistoric(userId : string, durationStats : number = 0)
{
	const cutoffDate = new Date();
	if (durationStats === 0)
		cutoffDate.setTime(0);
	else
		cutoffDate.setDate(cutoffDate.getDate() - durationStats);
	const games = await prisma.game.findMany({
		where: {
			OR: [{ black_player_id: userId }, { white_player_id: userId }],
			date: {
				gte: cutoffDate
			}
		},
		select: {
			id: true,
			date: true,
			black_player_id: true,
			black_player_elo: true,
			white_player_id: true,
			white_player_elo: true
		},
		orderBy: {
			date: 'asc'
		}
	})
	type GameData = typeof games[0];
	return games.map((game: GameData) => ({
		id: game.id,
		date: game.date,
		elo: game.black_player_id === userId ? game.black_player_elo : game.white_player_elo
	}));
}

export async function getLeaderboard()
{
	const leaderboard = await prisma.user.findMany({
		take: 50,
		select: {
			id: true,
			username: true,
			club: true,
			elo: true
		},
		orderBy: {
			elo: 'desc'
		}
	})
	return (leaderboard);
}

export async function getPlayerRank(userId : string) : Promise<number>
{
	const player = await prisma.user.findUniqueOrThrow({
		where: {
			id: userId
		},
		select: {
			elo: true
		}
	})
	const higherEloCount = await prisma.user.count({
		where: {
			elo: {
				gt: player.elo
			}
		}
	})
	return (higherEloCount + 1);
}
