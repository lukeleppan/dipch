import { db } from '$lib/server/db';
import { game, gameParticipant, player } from '$lib/server/db/schema';
import { eq, count, and, inArray } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { generateUniqueCode, isValidCode } from '$lib/codes';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const createPlayerSchema = z.object({
	name: z
		.string({ message: 'Name must be a string' })
		.min(2, 'Name must be at least 2 characters long')
		.max(25, 'Name must be no longer than 25 characters')
		.trim()
});

const createGameSchema = z.object({
	name: z
		.string({ message: 'Name must be a string' })
		.min(2, 'Name must be at least 2 characters long')
		.max(100, 'Name must be no longer than 100 characters')
		.trim(),
	playerIds: z
		.array(
			z.number({ message: 'Player ID must be a number' }).positive('Player ID must be a positive'),
			{
				message: 'Player IDs must be an array'
			}
		)
		.length(7, 'Must have exactly 7 players')
});

const deleteGameSchema = z.object({
	id: z.number()
});

export const load: PageServerLoad = async ({ request }) => {
	// Get stats
	const playerCount = await db
		.select({ count: count() })
		.from(player)
		.then((res) => res[0].count);

	const isActiveGame = await db
		.select({ count: count() })
		.from(game)
		.where(eq(game.isActive, true))
		.then((res) => res[0].count > 0);

	const assignedGames = await db
		.select({ count: count() })
		.from(game)
		.where(and(eq(game.isActive, false), eq(game.resultsReady, true)))
		.then((res) => res[0].count);

	// Get Players
	const players = await db.select().from(player);
	const currentGame = await db
		.select()
		.from(game)
		.where(eq(game.isActive, true))
		.then((res) => res[0]);
	let currentGameParticipants = null;
	currentGameParticipants = await db
		.select({
			id: player.id,
			name: player.name,
			hasSubmitted: gameParticipant.hasSubmitted
		})
		.from(gameParticipant)
		.leftJoin(player, eq(gameParticipant.playerId, player.id))
		.where(eq(gameParticipant.gameId, currentGame?.id));
	const completedGames = await db
		.select()
		.from(game)
		.where(and(eq(game.isActive, false), eq(game.resultsReady, true)));
	const completedGamesParticipants = await db
		.select({
			id: player.id,
			name: player.name,
			hasSubmitted: gameParticipant.hasSubmitted
		})
		.from(gameParticipant)
		.leftJoin(player, eq(gameParticipant.playerId, player.id))
		.where(
			inArray(
				gameParticipant.gameId,
				completedGames.map((compGame) => compGame.id)
			)
		);

	const createPlayerForm = await superValidate(request, zod(createPlayerSchema));
	const createGameForm = await superValidate(request, zod(createGameSchema));
	const deleteGameForm = await superValidate(request, zod(deleteGameSchema));

	return {
		createPlayerForm,
		createGameForm,
		deleteGameForm,
		stats: {
			playerCount,
			isActiveGame,
			assignedGames
		},
		players,
		currentGame: {
			...currentGame,
			players: currentGameParticipants
		},
		completedGames: completedGames.map((completedGame, index) => {
			return {
				...completedGame,
				players: completedGamesParticipants[index]
			};
		})
	};
};

export const actions = {
	createPlayer: async ({ request }) => {
		const createPlayerForm = await superValidate(request, zod(createPlayerSchema));

		if (!createPlayerForm.valid) {
			return message(createPlayerForm, { status: 400, text: 'Invalid player data' });
		}

		const code = await generateUniqueCode();
		if (!code || !isValidCode(code)) {
			return message(createPlayerForm, {
				status: 500,
				text: 'By the gods! Failed to generate unique player code. Please try again.'
			});
		}

		try {
			await db.insert(player).values({ name: createPlayerForm.data.name, code });
			return message(createPlayerForm, { status: 200, text: 'Player created successfully' });
		} catch (error) {
			return message(createPlayerForm, { status: 500, text: error });
		}
	},

	createGame: async ({ request }) => {
		const createGameForm = await superValidate(request, zod(createGameSchema));

		if (!createGameForm.valid) {
			return message(createGameForm, { status: 400, text: 'Invalid game data' });
		}

		const name = createGameForm.data.name;
		const playerIds = createGameForm.data.playerIds;

		const uniquePlayerIds = [...new Set(playerIds)];
		if (uniquePlayerIds.length !== playerIds.length) {
			return message(createGameForm, {
				status: 400,
				text: 'Player IDs must be unique'
			});
		}

		if ((await db.$count(game, eq(game.isActive, true))) > 0) {
			return message(createGameForm, {
				status: 400,
				text: 'There is already an active game'
			});
		}

		try {
			await db.transaction(async (tx) => {
				const newGame = (await tx.insert(game).values({ name, isActive: true }).returning())[0];

				for (const playerId of playerIds) {
					await tx.insert(gameParticipant).values({ gameId: newGame.id, playerId: playerId });
				}
			});

			return message(createGameForm, { status: 200, text: 'Game created successfully' });
		} catch (error) {
			return message(createGameForm, { status: 500, text: error });
		}
	},

	deleteGame: async ({ request }) => {
		const form = await superValidate(request, zod(deleteGameSchema));

		if (!form.valid) {
			return fail(400, { form, invalid: true, error: 'Invalid id' });
		}

		try {
			const id = form.data.id;
			await db.delete(game).where(eq(game.id, id));
			return { form, success: true };
		} catch (message) {
			return { form, error: true, message };
		}
	}
} satisfies Actions;
