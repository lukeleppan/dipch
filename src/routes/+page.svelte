<script lang="ts">
	import { onMount } from 'svelte';
	import Banner from '$lib/components/Banner.svelte';
	import CountryPreferenceSelector from '$lib/components/CountryPreferenceSelector.svelte';
	import { RefreshCw, Award, Clock, AlertCircle, Users } from '@lucide/svelte';
	import { invalidateAll } from '$app/navigation';
	import { toasts } from '$lib/stores/toast.js';

	const countryColors: Record<string, string> = {
		Austria: 'bg-red-200 text-black',
		England: 'bg-blue-200 text-black',
		France: 'bg-sky-200 text-black',
		Germany: 'bg-gray-200 text-black',
		Italy: 'bg-green-200 text-black',
		Russia: 'bg-purple-200 text-black',
		Turkey: 'bg-yellow-200 text-black'
	};

	let { data } = $props();

	function refresh() {
		invalidateAll();
		toasts.info('Refreshing...', RefreshCw, 750);
	}

	function getSatisfactionText(rank: number) {
		if (rank === 1) return 'Amazing! You got your top choice!';
		if (rank === 2) return 'Great! You got your second choice.';
		if (rank === 3) return 'Good! You got your third choice.';
		if (rank === 4) return 'You got your fourth choice.';
		if (rank === 5) return 'You got your fifth choice.';
		if (rank === 6) return 'You got your sixth choice.';
		return 'You got your last choice.';
	}

	onMount(() => {
		// Future: Add loading state and API call
	});
</script>

<Banner />

<div class="mb-6 text-center">
	<h1 class="mb-2 text-2xl font-bold">Welcome, {data.player.name}!</h1>
	{#if data.activeGame}
		<p class="text-muted-foreground">
			{data.activeGame.name}
		</p>
	{/if}
</div>

{#if !data.activeGame}
	<!-- No active game state -->
	<div class="bg-background mx-auto max-w-2xl rounded-lg p-8 text-center">
		<div class="mb-4 flex justify-center">
			<div class="bg-muted rounded-full p-3">
				<AlertCircle size={28} class="text-muted-foreground" />
			</div>
		</div>
		<h2 class="mb-2 text-xl font-semibold">No Active Game</h2>
		<p class="text-muted-foreground mb-6">
			There is currently no active game. Please check back later.
		</p>
		<button
			class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-4 py-2 hover:cursor-pointer"
			onclick={refresh}
		>
			<RefreshCw size={16} class="mr-2" />
			Check for Updates
		</button>
	</div>
{:else if !data.playerInGame}
	<div class="bg-background mx-auto my-16 max-w-xl text-center">
		<div class="mb-4 flex justify-center">
			<div class="bg-muted rounded-full p-3">
				<AlertCircle size={28} class="text-muted-foreground" />
			</div>
		</div>
		<h2 class="mb-2 text-xl font-semibold">Not in Game</h2>
		<p class="text-muted-foreground mb-6">You are not in the current game</p>
		<form method="POST" action="/logout">
			<button
				class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-2 hover:cursor-pointer"
			>
				Enter Another Code
			</button>
		</form>
	</div>
{:else if !data.player.hasSubmitted}
	<!-- Needs to submit preferences -->
	<div class="bg-background mx-auto max-w-lg rounded-lg p-6">
		<h2 class="mb-4 text-center text-xl font-semibold">Submit Your Country Preferences</h2>
		<p class="text-muted-foreground mb-6 text-center">
			Drag to rearrange the countries below in your order of preference (top is most preferred)
		</p>

		<CountryPreferenceSelector form={data.form} />
	</div>
{:else if !data.activeGame.resultsReady}
	<!-- Waiting for other players -->
	<div class="bg-background mx-auto max-w-2xl rounded-lg p-8 text-center">
		<div class="mb-4 flex justify-center">
			<div class="bg-muted rounded-full p-3">
				<Clock size={28} class="text-muted-foreground" />
			</div>
		</div>
		<h2 class="mb-2 text-xl font-semibold">Thanks for submitting!</h2>
		<p class="text-muted-foreground mb-4">
			We're waiting for other players to submit their preferences.
		</p>

		<div class="mb-6">
			<div class="mb-2 flex justify-between">
				<span class="text-sm">Player Submissions</span>
				<span class="text-sm font-medium">{data.playersSubmitted}/7</span>
			</div>
			<div class="bg-muted h-2 w-full rounded-full">
				<div
					class="bg-primary h-2 rounded-full"
					style="width: {(data.playersSubmitted / 7) * 100}%"
				></div>
			</div>
		</div>

		<button
			class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-4 py-2 hover:cursor-pointer"
			onclick={refresh}
		>
			<RefreshCw size={16} class="mr-2" />
			Check Status
		</button>
	</div>
{:else if data.activeGame.resultsReady && data.playerAssignment && data.playerScore}
	<!-- Results are ready -->
	<div class="bg-background mx-auto max-w-2xl rounded-lg p-8">
		<div class="mb-4 flex justify-center">
			<div class="bg-primary/20 rounded-full p-3">
				<Award size={28} class="text-primary" />
			</div>
		</div>
		<h2 class="mb-6 text-center text-xl font-semibold">Your Country Assignment</h2>

		<div class="mb-6 flex flex-col items-center">
			<div class="border-primary/50 overflow-hidden rounded-lg border-4 p-1">
				<div
					class="{countryColors[data.playerAssignment] ||
						'bg-gray-200'} flex h-32 w-32 items-center justify-center rounded-lg"
				>
					<span class="text-2xl font-bold">{data.playerAssignment}</span>
				</div>
			</div>

			{#if data.playerRank}
				<p class="mt-4 text-center font-medium">
					{getSatisfactionText(data.playerRank)}
				</p>
				<p class="text-muted-foreground mt-1 text-center text-sm">
					Choice #{data.playerRank} &#8226; {(data.playerScore / 10) * 100}% satisfied
				</p>
			{/if}
		</div>

		<!-- All Assignments -->
		<div class="mt-8 rounded-lg p-6">
			<div class="mb-4 flex items-center justify-center">
				<h3 class="ml-2 text-2xl font-medium">All Assignments</h3>
			</div>

			<div class="my-4 rounded-lg">
				<div class="grid grid-cols-2 gap-4">
					{#if data.activeGame.totalSatisfaction !== null && data.activeGame.totalSatisfaction !== undefined}
						<div class="bg-card rounded-lg p-2 text-center shadow-sm">
							<p class="text-muted-foreground text-sm">Overall Satisfaction</p>
							<p class="mt-2 text-4xl font-medium">
								{((data.activeGame.totalSatisfaction / 70) * 100).toFixed(1)}%
							</p>
							<p class="text-muted-foreground text-xs">
								{data.activeGame.totalSatisfaction}/70 points
							</p>
						</div>
					{/if}

					{#if data.activeGame.totalRank !== null && data.activeGame.totalRank !== undefined}
						<div class="bg-card rounded-lg p-2 text-center shadow-sm">
							<p class="text-muted-foreground text-sm">Average Choice</p>
							<p class="mt-2 text-4xl font-medium">
								{(data.activeGame.totalRank / 7).toFixed(1)}
							</p>
							<p class="text-muted-foreground text-xs">(Lower is better)</p>
						</div>
					{/if}
				</div>
			</div>

			<div class="flex flex-col gap-3">
				{#if data.allAssignments}
					{#each data.allAssignments as assignment (assignment.playerId)}
						<!-- Get player preference and score from data -->
						{@const playerPref = data.allPreferencesData?.find(
							(p) => p.playerId === assignment.playerId && p.country === assignment.country
						)}

						<div class="bg-background flex items-center rounded-lg border p-3">
							<div
								class="{countryColors[assignment.country] ||
									'bg-gray-200'} mr-3 flex h-10 w-10 items-center justify-center rounded-full"
							>
								<span class="text-xs font-semibold">{assignment.country.substring(0, 3)}</span>
							</div>
							<div class="flex-1">
								<div class="flex items-center justify-between">
									<p class="font-medium">{assignment.playerName}</p>
									{#if playerPref}
										<div class="flex items-center gap-2">
											<span class="bg-card text-card-foreground rounded-full px-2 py-0.5 text-xs">
												#{playerPref.rank}
											</span>
											<span
												class="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs"
											>
												{Math.round((playerPref.score / 10) * 100)}% satisfied
											</span>
										</div>
									{/if}
								</div>
								<p class="text-muted-foreground text-sm">{assignment.country}</p>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{:else}
	<!-- Something went wrong -->
	<div class="bg-background mx-auto my-16 max-w-xl text-center">
		<div class="mb-4 flex justify-center">
			<div class="bg-muted rounded-full p-3">
				<AlertCircle size={28} class="text-muted-foreground" />
			</div>
		</div>
		<h2 class="mb-2 text-xl font-semibold">Something went Wrong</h2>
		<p class="text-muted-foreground mb-6">Try entering another code</p>
		<form method="POST" action="/logout">
			<button
				class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-2 hover:cursor-pointer"
			>
				Enter Another Code
			</button>
		</form>
	</div>
{/if}
