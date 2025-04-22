import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, primaryKey, unique, check } from 'drizzle-orm/sqlite-core';

// Define the valid Diplomacy countries
// TODO: Define this globally
// const VALID_COUNTRIES = ['England', 'France', 'Germany', 'Italy', 'Austria', 'Russia', 'Turkey'];
const COUNTRY_CHECK = sql`country IN ('England', 'France', 'Germany', 'Italy', 'Austria', 'Russia', 'Turkey')`;

export const game = sqliteTable('game', {
	id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
	name: text('name').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	completedAt: integer('completed_at', { mode: 'timestamp' }),
	isActive: integer('is_active', { mode: 'boolean' }).default(false),
	resultsReady: integer('results_ready', { mode: 'boolean' }).default(false),
	totalRank: integer('total_rank').default(0),
	totalSatisfaction: integer('total_satisfaction').default(0)
});

export const player = sqliteTable('player', {
	id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
	name: text('name').notNull(),
	code: text('code').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

export const gameParticipant = sqliteTable(
	'game_participant',
	{
		gameId: integer('game_id')
			.notNull()
			.references(() => game.id, { onDelete: 'cascade' }),
		playerId: integer('player_id')
			.notNull()
			.references(() => player.id),
		hasSubmitted: integer('has_submitted', { mode: 'boolean' }).default(false),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(table) => [primaryKey({ columns: [table.gameId, table.playerId] })]
);

export const preference = sqliteTable(
	'preference',
	{
		id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
		gameId: integer('game_id')
			.notNull()
			.references(() => game.id, { onDelete: 'cascade' }),
		playerId: integer('player_id')
			.notNull()
			.references(() => player.id),
		country: text('country').notNull(),
		rank: integer('rank').notNull(), // Lower rank = higher preference
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(table) => [
		unique().on(table.gameId, table.playerId, table.rank),
		unique().on(table.gameId, table.playerId, table.country),
		check('country_check', sql`${COUNTRY_CHECK}`)
	]
);

export const assignment = sqliteTable(
	'assignment',
	{
		gameId: integer('game_id')
			.notNull()
			.references(() => game.id, { onDelete: 'cascade' }),
		playerId: integer('player_id')
			.notNull()
			.references(() => player.id),
		country: text('country').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(table) => [
		primaryKey({ columns: [table.gameId, table.playerId] }),
		unique().on(table.gameId, table.playerId, table.country),
		check('country_check', sql`${COUNTRY_CHECK}`)
	]
);
