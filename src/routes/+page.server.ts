import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { verifyPlayerJWT } from '$lib/server/auth';
import { message, superValidate } from 'sveltekit-superforms';
import { z } from 'zod';
import { zod } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { game, player, gameParticipant, preference, assignment } from '$lib/server/db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { calculateResults } from '$lib/server/db/algorithm';
import { SATISFACTION_TABLE } from '$lib/server/algorithm';

const schema = z.object({
	preferences: z.array(z.object({ rank: z.number(), country: z.string() }))
});

export const load: PageServerLoad = async ({ request, cookies }) => {
	const playerToken = cookies.get('player_token');

	if (!playerToken) {
		redirect(303, '/start');
	}

	const payload = verifyPlayerJWT(playerToken);
	if (!payload) {
		cookies.delete('player_token', { path: '/' });
		redirect(303, '/start');
	}

	const form = await superValidate(request, zod(schema));

	const playerData = await db
		.select({ id: player.id, name: player.name, hasSubmitted: gameParticipant.hasSubmitted })
		.from(player)
		.where(eq(player.id, payload.id))
		.leftJoin(gameParticipant, eq(player.id, gameParticipant.playerId))
		.then((res) => res[0]);

	const activeGame = await db
		.select({
			id: game.id,
			name: game.name,
			resultsReady: game.resultsReady,
			totalRank: game.totalRank,
			totalSatisfaction: game.totalSatisfaction
		})
		.from(game)
		.where(eq(game.isActive, true))
		.then((res) => res[0]);

	if (!activeGame) {
		return { form, player: playerData };
	}

	const playerInGame =
		(await db.$count(
			gameParticipant,
			and(eq(gameParticipant.gameId, activeGame.id), eq(gameParticipant.playerId, playerData.id))
		)) > 0;

	const playersSubmitted = await db.$count(
		gameParticipant,
		and(eq(gameParticipant.gameId, activeGame.id), eq(gameParticipant.hasSubmitted, true))
	);

	if (!activeGame.resultsReady) {
		return { form, player: playerData, activeGame, playerInGame, playersSubmitted };
	}

	let playerAssignment = null;
	let playerRank = null;
	let playerScore = null;
	let allAssignments = null;
	let allPreferencesData = null;

	const assignmentData = await db
		.select({
			country: assignment.country
		})
		.from(assignment)
		.where(and(eq(assignment.gameId, activeGame.id), eq(assignment.playerId, playerData.id)))
		.then((res) => res[0] || null);

	if (assignmentData) {
		playerAssignment = assignmentData.country;

		// Get the rank and satisfaction score
		const preferenceData = await db
			.select({
				rank: preference.rank
			})
			.from(preference)
			.where(
				and(
					eq(preference.gameId, activeGame.id),
					eq(preference.playerId, playerData.id),
					eq(preference.country, assignmentData.country)
				)
			)
			.then((res) => res[0] || null);

		if (preferenceData) {
			playerRank = preferenceData.rank;
			// Map rank to satisfaction score using the SATISFACTION_TABLE
			const satisfactionMap = SATISFACTION_TABLE;
			playerScore = satisfactionMap[playerRank] || 0;
		}

		// Get all assignments for display
		allAssignments = await db
			.select({
				playerId: assignment.playerId,
				playerName: player.name,
				country: assignment.country
			})
			.from(assignment)
			.where(eq(assignment.gameId, activeGame.id))
			.innerJoin(player, eq(assignment.playerId, player.id))
			.orderBy(player.name);

		allPreferencesData = await db
			.select({
				playerId: preference.playerId,
				country: preference.country,
				rank: preference.rank
			})
			.from(preference)
			.where(
				and(
					eq(preference.gameId, activeGame.id),
					// Only get preferences for countries that were assigned
					inArray(
						preference.country,
						allAssignments.map((a) => a.country)
					)
				)
			)
			.then((res) =>
				res.map((pref) => {
					// Calculate satisfaction score based on rank
					const satisfactionMap = SATISFACTION_TABLE;
					return {
						...pref,
						score: satisfactionMap[pref.rank] || 0
					};
				})
			);
	}

	return {
		form,
		player: playerData,
		activeGame,
		playerInGame,
		playersSubmitted,
		playerAssignment,
		playerRank,
		playerScore,
		allAssignments,
		allPreferencesData
	};
};

export const actions = {
	default: async ({ request, cookies }) => {
		const token = cookies.get('player_token');
		if (!token) {
			redirect(303, '/start');
		}

		const payload = verifyPlayerJWT(token);
		if (!payload) {
			cookies.delete('player_token', { path: '/' });
			redirect(303, '/start');
		}

		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			return message(form, { status: 400, text: 'Invalid preference data' });
		}

		const preferences = form.data.preferences;
		try {
			const gameData = await db
				.select()
				.from(game)
				.where(eq(game.isActive, true))
				.then((res) => res[0]);
			if (!gameData) {
				return message(form, { status: 500, text: 'Internal server error' });
			}
			await db.transaction(async (tx) => {
				for (const pref of preferences) {
					await tx.insert(preference).values({
						gameId: gameData.id,
						playerId: payload.id,
						country: pref.country,
						rank: pref.rank
					});
				}

				await tx
					.update(gameParticipant)
					.set({ hasSubmitted: true })
					.where(
						and(eq(gameParticipant.playerId, payload.id), eq(gameParticipant.gameId, gameData.id))
					);
			});

			const playersSubmitted = await db.$count(
				gameParticipant,
				and(eq(gameParticipant.gameId, gameData.id), eq(gameParticipant.hasSubmitted, true))
			);

			console.log('playersSubmitted: ', playersSubmitted);

			if (playersSubmitted === 7) {
				await calculateResults();
			}
		} catch (error) {
			console.error(error);
			return message(form, { status: 500, text: 'Internal server error' });
		}
	}
} satisfies Actions;
