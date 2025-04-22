<script lang="ts">
	import { Circle, CircleCheck, Gamepad2 } from '@lucide/svelte';

	export let currentGame: {
		players: {
			id: number | null;
			name: string | null;
			hasSubmitted: boolean | null;
		}[];
		id: number;
		name: string;
		createdAt: Date;
		completedAt: Date | null;
		isActive: boolean | null;
		resultsReady: boolean | null;
	};
	export let stats: {
		playerCount: number;
		isActiveGame: boolean;
		assignedGames: number;
	};
</script>

<!-- Current Game Section -->
<div class="bg-card text-card-foreground mb-8 rounded-lg p-6 shadow">
	<h2 class="mb-4 text-2xl font-bold">Current Game</h2>

	<div class="bg-background rounded-lg p-6 shadow">
		{#if stats.isActiveGame && currentGame}
			<div class="space-y-6">
				<!-- Game Header -->
				<div class="flex flex-wrap items-center justify-between gap-4">
					<div>
						<h3 class="text-xl font-medium">{currentGame.name}</h3>
						<p class="text-muted-foreground text-sm">
							Created {new Date(currentGame.createdAt).toLocaleDateString()}
						</p>
					</div>
					<div class="flex flex-wrap items-center gap-4">
						<div class="text-center">
							<span class="block text-xl font-bold">{currentGame.players?.length || 0}</span>
							<span class="text-muted-foreground text-sm">Players</span>
						</div>
						<div class="text-center">
							<span class="block text-xl font-bold">
								{currentGame.players?.filter((p) => p.hasSubmitted).length || 0}
							</span>
							<span class="text-muted-foreground text-sm">Submitted</span>
						</div>
					</div>
				</div>

				<!-- Submissions Progress -->
				<div>
					<div class="mb-2 flex justify-between">
						<span class="text-sm font-medium">Preference Submissions</span>
						<span class="text-sm font-medium">
							{currentGame.players?.filter((p) => p.hasSubmitted).length || 0}/{currentGame.players
								?.length || 0}
						</span>
					</div>
					<div class="bg-muted h-2.5 w-full rounded-full">
						{#if currentGame.players?.length}
							<div
								class="bg-primary h-2.5 rounded-full"
								style="width: {(currentGame.players.filter((p) => p.hasSubmitted).length /
									currentGame.players.length) *
									100}%"
							></div>
						{/if}
					</div>
				</div>

				<!-- Players List -->
				<div>
					<h4 class="mb-3 font-medium">Participants</h4>
					<div class="border-border overflow-hidden rounded-lg border">
						<table class="divide-border min-w-full divide-y">
							<thead class="bg-muted">
								<tr>
									<th class="px-4 py-3 text-left text-xs font-medium tracking-wider uppercase"
										>ID</th
									>
									<th class="px-4 py-3 text-left text-xs font-medium tracking-wider uppercase"
										>Player</th
									>
									<th class="px-4 py-3 text-left text-xs font-medium tracking-wider uppercase"
										>Status</th
									>
								</tr>
							</thead>
							<tbody class="divide-border bg-background divide-y">
								{#if currentGame.players && currentGame.players.length > 0}
									{#each currentGame.players as player (player.id)}
										<tr>
											<td class="px-4 py-3 text-sm whitespace-nowrap">{player.id}</td>
											<td class="px-4 py-3 text-sm font-medium">{player.name}</td>
											<td class="px-4 py-3 text-sm">
												{#if player.hasSubmitted}
													<span
														class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300"
													>
														<CircleCheck class="mr-1.5 h-2 w-2 text-green-500" />
														Submitted
													</span>
												{:else}
													<span
														class="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
													>
														<Circle class="mr-1.5 h-2 w-2 text-yellow-500" />
														Pending
													</span>
												{/if}
											</td>
										</tr>
									{/each}
								{:else}
									<tr>
										<td colspan="3" class="text-muted-foreground px-4 py-4 text-center text-sm">
											No players have joined this game yet.
										</td>
									</tr>
								{/if}
							</tbody>
						</table>
					</div>
				</div>

				<!-- Game Stats -->
				{#if currentGame.players && currentGame.players.length > 0}
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<div class="border-border bg-background rounded-lg border p-4">
							<h5 class="text-muted-foreground text-sm font-medium">Completion Rate</h5>
							<p class="text-2xl font-bold">
								{Math.round(
									(currentGame.players.filter((p) => p.hasSubmitted).length /
										currentGame.players.length) *
										100
								)}%
							</p>
						</div>
						<div class="border-border bg-background rounded-lg border p-4">
							<h5 class="text-muted-foreground text-sm font-medium">Time Active</h5>
							<p class="text-2xl font-bold">
								{Math.ceil(
									(Date.now() - new Date(currentGame.createdAt).getTime()) / (1000 * 60 * 60 * 24)
								)} days
							</p>
						</div>
						<div class="border-border bg-background rounded-lg border p-4">
							<h5 class="text-muted-foreground text-sm font-medium">Remaining</h5>
							<p class="text-2xl font-bold">
								{currentGame.players.length -
									currentGame.players.filter((p) => p.hasSubmitted).length} players
							</p>
						</div>
					</div>
				{/if}
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center p-8 text-center">
				<div class="bg-muted mb-4 rounded-full p-3">
					<Gamepad2 class="text-muted-foreground h-6 w-6" />
				</div>
				<h3 class="mb-1 text-lg font-medium">No Active Game</h3>
				<p class="text-muted-foreground mb-4">
					Create a new game to start collecting player preferences.
				</p>
				<button
					class="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow focus-visible:ring-1 focus-visible:outline-none"
				>
					Create Game
				</button>
			</div>
		{/if}
	</div>
</div>
