<script lang="ts">
	import { onMount } from 'svelte';
	import { Sun, Moon } from '@lucide/svelte';
	import { theme } from '$lib/stores/theme';

	onMount(() => {
		theme.initialize();
	});

	function toggleTheme() {
		theme.toggle();
	}
</script>

<button
	onclick={toggleTheme}
	class="p-2 transition-all hover:scale-110 hover:cursor-pointer"
	aria-label={$theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
>
	{#if $theme === 'dark'}
		<Moon size={24} />
	{:else}
		<Sun size={24} />
	{/if}
</button>
