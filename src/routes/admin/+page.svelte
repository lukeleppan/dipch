<script lang="ts">
	import Form from '$lib/components/Form.svelte';
	import TextField from '$lib/components/TextField.svelte';
	import { enhance } from '$app/forms';
	import { slide } from 'svelte/transition';
	import { Loader, X } from '@lucide/svelte';
	import type { SuperForm } from 'sveltekit-superforms';
	import CurrentGame from './CurrentGame.svelte';

	let { data } = $props();

	const maxPlayers = 7;

	let searchQuery = $state('');
	let selectedPlayers = $state<{ id: number; name: string; code: string; createdAt: Date }[]>([]);
	let showDropdown = $state(false);

	let filteredPlayers = $derived(
		searchQuery
			? data.players.filter(
					(player) =>
						!selectedPlayers.some((p) => p.id === player.id) &&
						player.name.toLowerCase().includes(searchQuery.toLowerCase())
				)
			: []
	);

	let canAddPlayer = $derived(selectedPlayers.length < maxPlayers);

	// Methods
	function selectPlayer(
		player: { id: number; name: string; code: string; createdAt: Date },
		superform: SuperForm<{ name: string; playerIds: number[] }>
	) {
		if (!selectedPlayers.some((p) => p.id === player.id)) {
			selectedPlayers.push(player);
			searchQuery = '';
			showDropdown = false;
			superform.form.update(($form) => {
				$form.playerIds = selectedPlayers.map((p) => p.id);
				return $form;
			});
		}
	}

	function removePlayer(id: number, superform: SuperForm<{ name: string; playerIds: number[] }>) {
		selectedPlayers = selectedPlayers.filter((player) => player.id !== id);
		superform.form.update(($form) => {
			$form.playerIds = selectedPlayers.map((p) => p.id);
			return $form;
		});
	}
</script>

<div class="mb-8 flex items-end">
	<h1 class="text-3xl font-bold">Dashboard (dipch)</h1>
	<form method="POST" action="/admin/logout" use:enhance>
		<button class="ml-4 text-base text-gray-500 hover:cursor-pointer hover:underline">
			logout
		</button>
	</form>
</div>

<!-- Stats Cards -->
<div class="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
	<div class="bg-card text-card-foreground rounded-lg p-6 shadow">
		<h3>Total Players</h3>
		<p class="text-2xl font-bold">{data.stats.playerCount}</p>
	</div>

	<div class="bg-card text-card-foreground rounded-lg p-6 shadow">
		<h3>Active Game</h3>
		<p class="text-2xl font-bold">{data.stats.isActiveGame ? 'Yes' : 'No'}</p>
	</div>

	<div class="bg-card text-card-foreground rounded-lg p-6 shadow">
		<h3>Assigned Games</h3>
		<p class="text-2xl font-bold">{data.stats.assignedGames}</p>
	</div>
</div>

<!-- Main Content: Players List (Left) and Forms (Right) -->
<div class="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
	<!-- Left Column: Players List -->
	<div class="lg:col-span-1">
		<div class="bg-card text-card-foreground h-full rounded-lg p-6 shadow">
			<h2 class="mb-4 text-xl font-bold">Players</h2>
			<div class="max-h-[500px] overflow-y-auto">
				<div class="border-border overflow-hidden rounded-lg border">
					<table class="divide-border min-w-full divide-y">
						<thead class="bg-muted sticky top-0">
							<tr>
								<th
									scope="col"
									class="px-4 py-3 text-left text-xs font-medium tracking-wider uppercase"
								>
									ID
								</th>
								<th
									scope="col"
									class="px-4 py-3 text-left text-xs font-medium tracking-wider uppercase"
								>
									Name
								</th>
								<th
									scope="col"
									class="px-4 py-3 text-right text-xs font-medium tracking-wider uppercase"
								>
									Code
								</th>
							</tr>
						</thead>
						<tbody class="divide-border bg-background divide-y">
							{#each data.players as player (player.id)}
								<tr class="hover:bg-muted/50">
									<td class="text-muted-foreground px-4 py-3 font-mono text-sm whitespace-nowrap">
										{player.id}
									</td>
									<td class="max-w-[95px] px-4 py-3 text-sm font-medium">
										<div
											class="overflow-hidden text-ellipsis whitespace-nowrap"
											title={player.name}
										>
											{player.name}
										</div>
									</td>
									<td
										class="px-4 py-3 text-right font-mono text-sm whitespace-nowrap text-purple-700 dark:text-purple-400"
									>
										{player.code}
									</td>
								</tr>
							{/each}

							{#if data.players.length === 0}
								<tr>
									<td colspan="3" class="text-muted-foreground px-4 py-4 text-center text-sm">
										No players available
									</td>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>

	<!-- Right Column: Forms -->
	<div class="flex flex-col gap-6 lg:col-span-2">
		<!-- Create Player Form -->
		<div class="bg-card text-card-foreground rounded-lg p-6 shadow">
			<h2 class="mb-4 text-xl font-bold">Create Player</h2>
			<Form
				action="?/createPlayer"
				data={data.createPlayerForm}
				let:superform
				let:delayed
				let:errors
			>
				<div class="mb-4">
					<TextField type="text" {superform} field="name" label="Name" placeholder="Name" />
					{#if errors.name}
						<span class="text-sm text-red-700 dark:text-red-300">{errors.name}</span>
					{/if}
				</div>
				<button
					class="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow focus-visible:ring-1 focus-visible:outline-none"
					disabled={delayed}
				>
					{#if delayed}
						<Loader class="animate-spin text-center" />
					{:else}
						Create Player
					{/if}
				</button>
			</Form>
		</div>

		<!-- Create Game Form -->
		<div class="bg-card text-card-foreground rounded-lg p-6 shadow">
			<h2 class="mb-4 text-xl font-bold">Create Game</h2>
			<Form
				action="?/createGame"
				dataType="json"
				data={data.createGameForm}
				let:superform
				let:errors
			>
				<TextField type="text" {superform} field="name" label="Name" placeholder="Name" />
				<div class="w-full">
					<div class="mb-4">
						<label for="players" class="mb-2 block text-sm font-medium"> Players </label>

						<!-- Selected Players -->
						{#if selectedPlayers.length > 0}
							<div class="mb-3 flex flex-wrap gap-2">
								{#each selectedPlayers as selectedPlayer (selectedPlayer.id)}
									<div
										class="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-blue-800"
										transition:slide
									>
										<span class="text-xs font-medium">{selectedPlayer.name}</span>
										<button
											type="button"
											class="ml-1 rounded-full p-0.5 hover:bg-blue-200"
											onclick={() => removePlayer(selectedPlayer.id, superform)}
											aria-label="Remove player"
										>
											<X class="h-3 w-3" />
										</button>
									</div>
								{/each}
							</div>
						{/if}

						<!-- Player Search -->
						{#if canAddPlayer}
							<div class="relative">
								<div class="relative flex items-center">
									<input
										type="text"
										placeholder="Search by player name..."
										class="placeholder:text-muted-foreground focus:ring-ring w-full rounded-lg border bg-transparent p-2 focus:ring-1 focus:outline-none"
										bind:value={searchQuery}
										onfocus={() => {
											showDropdown = true;
										}}
									/>
									{#if searchQuery}
										<button
											type="button"
											class="absolute right-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
											onclick={() => {
												searchQuery = '';
											}}
											aria-label="Clear search"
										>
											<X class="h-4 w-4" />
										</button>
									{/if}
								</div>

								<!-- Dropdown Results -->
								{#if showDropdown && searchQuery && filteredPlayers.length > 0}
									<div
										class="ring-opacity-5 ring-ring bg-background absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg shadow-lg ring-1"
										transition:slide={{ duration: 150 }}
									>
										<ul class="py-1">
											{#each filteredPlayers as filteredPlayer (filteredPlayer.id)}
												<li>
													<button
														type="button"
														class="hover:bg-card w-full px-4 py-2 text-left text-sm"
														onclick={() => selectPlayer(filteredPlayer, superform)}
													>
														<div class="flex items-center justify-between">
															<div class="flex items-center">
																<span class="text-muted-foreground font-mono text-xs"
																	>{filteredPlayer.id}</span
																>
																<span class="ml-2 font-medium">{filteredPlayer.name}</span>
															</div>
															<span class="font-mono text-xs text-indigo-600 dark:text-indigo-400"
																>{filteredPlayer.code}</span
															>
														</div>
													</button>
												</li>
											{/each}
										</ul>
									</div>
								{:else if showDropdown && searchQuery && filteredPlayers.length === 0}
									<div
										class="ring-opacity-5 absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black"
										transition:slide={{ duration: 150 }}
									>
										<div class="p-4 text-sm text-gray-500">No players found.</div>
									</div>
								{/if}
							</div>

							{#if errors.playerIds?._errors}
								<span class="text-sm text-red-700 dark:text-red-300">
									{errors.playerIds?._errors[0]}
									<!-- {toasts.error(errors.playerIds?._errors[0]) && false} -->
								</span>
							{/if}

							{#if selectedPlayers.length === 0}
								<p class="mt-2 text-sm text-gray-500">
									No players selected yet. Search and select players to add them to the game.
								</p>
							{/if}
						{:else}
							<p class="text-sm text-amber-600">
								Maximum number of players reached ({maxPlayers}).
							</p>
						{/if}
					</div>
				</div>
				<button
					class="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow focus-visible:ring-1 focus-visible:outline-none"
				>
					Create Game
				</button>
			</Form>
		</div>
	</div>
</div>

<CurrentGame currentGame={data.currentGame} stats={data.stats} />

<!-- Previous Games Section -->
<div class="bg-card text-card-foreground h-full rounded-lg p-6 shadow">
	<h2 class="mb-4 text-2xl font-bold">Previous Games</h2>
	<div class="bg-background rounded-lg p-6 shadow">
		<div class="text-muted-foreground p-4 text-center">
			Previous games history would appear here
		</div>
	</div>
</div>
