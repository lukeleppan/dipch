<script lang="ts">
	import { Loader, OctagonX } from '@lucide/svelte';
	import Form from '$lib/components/Form.svelte';
	import TextField from '$lib/components/TextField.svelte';
	import { slide } from 'svelte/transition';

	let { data } = $props();
</script>

<section class="mt-12 flex items-center justify-center">
	<div class="bg-card text-card-foreground w-full max-w-md rounded-lg p-8 shadow-md">
		<h1 class="mb-6 text-center text-2xl font-bold">Admin Login</h1>
		<Form data={data.form} invalidateAll={false} let:message let:superform let:delayed>
			{#if message?.status >= 400}
				<div
					class="mb-4 flex items-center rounded-lg border-2 border-red-700 bg-red-300 p-6 text-black"
					transition:slide
				>
					<OctagonX />
					<p class="ml-2 text-sm">{message.text}</p>
				</div>
			{/if}
			<div class="mb-4">
				<TextField
					type="text"
					{superform}
					field="username"
					label="Username"
					autocomplete="username"
				/>
			</div>
			<div class="mb-4">
				<TextField
					type="password"
					{superform}
					field="password"
					label="Password"
					autocomplete="current-password"
				/>
			</div>

			<button
				class="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:cursor-pointer hover:bg-blue-700 focus:outline-none"
				disabled={delayed}
			>
				{#if delayed}
					<Loader class="animate-spin" />
				{:else}
					Login
				{/if}
			</button>
		</Form>
	</div>
</section>
