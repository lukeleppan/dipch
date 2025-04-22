CREATE TABLE `assignment` (
	`game_id` integer NOT NULL,
	`player_id` integer NOT NULL,
	`country` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`game_id`, `player_id`),
	FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "country_check" CHECK(country IN ('England', 'France', 'Germany', 'Italy', 'Austria', 'Russia', 'Turkey'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assignment_game_id_player_id_country_unique` ON `assignment` (`game_id`,`player_id`,`country`);--> statement-breakpoint
CREATE TABLE `game` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`completed_at` integer,
	`is_active` integer DEFAULT false,
	`results_ready` integer DEFAULT false,
	`total_rank` integer DEFAULT 0,
	`total_satisfaction` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `game_participant` (
	`game_id` integer NOT NULL,
	`player_id` integer NOT NULL,
	`has_submitted` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`game_id`, `player_id`),
	FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `player` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `player_code_unique` ON `player` (`code`);--> statement-breakpoint
CREATE TABLE `preference` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` integer NOT NULL,
	`player_id` integer NOT NULL,
	`country` text NOT NULL,
	`rank` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "country_check" CHECK(country IN ('England', 'France', 'Germany', 'Italy', 'Austria', 'Russia', 'Turkey'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `preference_game_id_player_id_rank_unique` ON `preference` (`game_id`,`player_id`,`rank`);--> statement-breakpoint
CREATE UNIQUE INDEX `preference_game_id_player_id_country_unique` ON `preference` (`game_id`,`player_id`,`country`);