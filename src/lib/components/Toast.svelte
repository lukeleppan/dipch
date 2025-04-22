<script lang="ts">
	import { slide } from 'svelte/transition';
	import { toasts } from '$lib/stores/toast';
	import { cn } from '$lib/utils';
	import { X } from '@lucide/svelte';

	let { position = 'bottom-right' } = $props();

	function handleMouseEnter(toastId: string) {
		toasts.pause(toastId);
	}

	function handleMouseLeave(toastId: string) {
		toasts.resume(toastId);
	}
</script>

{#if $toasts.length > 0}
	<div
		class={cn(
			'fixed z-50 w-full p-3 sm:p-4',
			position === 'bottom-right' ? 'right-0 bottom-0 md:right-4 md:bottom-4 md:max-w-sm' : '',
			position === 'bottom-left' ? 'bottom-0 left-0 md:bottom-4 md:left-4 md:max-w-sm' : '',
			position === 'top-right' ? 'top-0 right-0 md:top-4 md:right-4 md:max-w-sm' : '',
			position === 'top-left' ? 'top-0 left-0 md:top-4 md:left-4 md:max-w-sm' : ''
		)}
		aria-live="polite"
		aria-atomic="true"
	>
		{#each $toasts as toast (toast.id)}
			{@const Icon = toast.icon}
			<div
				class="mb-3 flex w-full items-center overflow-hidden rounded-lg border-l-2 bg-gray-800 text-white shadow-md"
				transition:slide|global
				onmouseenter={() => handleMouseEnter(toast.id)}
				onmouseleave={() => handleMouseLeave(toast.id)}
				role="alert"
			>
				<div
					class={cn(
						'mr-2 ml-4',
						toast.type === 'success' ? 'text-green-500' : '',
						toast.type === 'error' ? 'text-red-500' : '',
						toast.type === 'warning' ? 'text-yellow-500' : '',
						toast.type === 'info' ? 'text-blue-500' : ''
					)}
				>
					<Icon />
				</div>
				<div class="flex-1 py-4 pr-3">
					<p class="text-sm font-medium">{toast.message}</p>
				</div>
				<button
					class="mx-2 rounded p-2 text-gray-400 transition-colors hover:bg-gray-700"
					onclick={() => toasts.remove(toast.id)}
					aria-label="Close notification"
				>
					<X size={16} />
				</button>
			</div>
		{/each}
	</div>
{/if}
