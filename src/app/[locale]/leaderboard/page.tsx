import { getLeaderboard } from "@/src/lib/stats";
import LeaderboardClientView from "@/src/components/LeaderboardClientView";

export default async function LeaderboardPage () {
	const leaderboard = await getLeaderboard();
	return <LeaderboardClientView leaderboard={leaderboard} />
}