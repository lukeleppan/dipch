import { and, eq } from 'drizzle-orm';
import { db } from '.';
import { game, gameParticipant, preference, assignment } from './schema';
import type { AlgoritmData, Preference, AssignmentResult } from '../algorithm';
import { assignCountries } from '../algorithm';

export async function calculateResults() {
	const gameId = await getActiveGameId();
	const playerIds = await getPlayerIds(gameId);

	// Create the algorithm data structure
	const playerLists = await Promise.all(
		playerIds.map(async (playerId) => {
			const preferences = await getPreferences(gameId, playerId);
			return {
				playerId,
				preferences
			};
		})
	);

	console.log('Game ID: ', gameId);

	const algorithmData: AlgoritmData = {
		gameId,
		playerLists
	};

	const result = await assignCountries(algorithmData);

	console.log('Result: ', result);

	// Save the assignments to the database
	await saveAssignments(result);

	// Update the game to mark results as ready
	await updateGame(gameId, result.totalRank, result.totalSatisfactionScore);

	return result;
}

async function getActiveGameId(): Promise<number> {
	return await db
		.select({ id: game.id })
		.from(game)
		.where(eq(game.isActive, true))
		.then((res) => res[0].id);
}

async function getPlayerIds(gameId: number): Promise<number[]> {
	return await db
		.select({ id: gameParticipant.playerId })
		.from(gameParticipant)
		.where(eq(gameParticipant.gameId, gameId))
		.then((res) => res.map((p) => p.id));
}

async function getPreferences(gameId: number, playerId: number): Promise<Preference[]> {
	return await db
		.select({
			country: preference.country,
			rank: preference.rank
		})
		.from(preference)
		.where(and(eq(preference.gameId, gameId), eq(preference.playerId, playerId)))
		.orderBy(preference.rank)
		.then((res) =>
			res.map((p) => ({
				country: p.country,
				rank: p.rank
			}))
		);
}

async function saveAssignments(result: AssignmentResult): Promise<void> {
	await db.delete(assignment).where(eq(assignment.gameId, result.gameId));

	const assignmentValues = result.assignments.map((a) => ({
		gameId: result.gameId,
		playerId: a.playerId,
		country: a.country
	}));

	await db.insert(assignment).values(assignmentValues);
}

async function updateGame(
	gameId: number,
	totalRank: number,
	totalSatisfaction: number
): Promise<void> {
	await db
		.update(game)
		.set({ resultsReady: true, totalRank, totalSatisfaction })
		.where(eq(game.id, gameId));
}
