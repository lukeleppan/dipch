<script lang="ts">
	import DarkModeToggle from '$lib/components/DarkModeToggle.svelte';
	import { Github, LogOut } from '@lucide/svelte';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
</script>

<header class="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
	<!-- Left side: Conditionally show Enter Code button on home page -->
	<div>
		{#if $page.url.pathname === '/'}
			<form action="/logout" method="POST" use:enhance>
				<button
					type="submit"
					class="border-border bg-background hover:bg-muted inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium"
				>
					<LogOut size={16} />
					<span>Enter Code</span>
				</button>
			</form>
		{:else}
			<div></div>
			<!-- Placeholder to maintain layout balance -->
		{/if}
	</div>

	<!-- Right side: Links and toggle -->
	<div class="flex items-center">
		<a
			href="https://github.com/lukeleppan/dipch"
			class="p-2 transition-all hover:scale-110"
			target="_blank"
			aria-label="GitHub repository"
		>
			<Github size={24} />
		</a>
		<DarkModeToggle />
	</div>
</header>
