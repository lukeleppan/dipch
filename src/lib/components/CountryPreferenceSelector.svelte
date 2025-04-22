<script lang="ts" module>
	type T = Record<string, unknown>;
</script>

<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import { GripVertical } from '@lucide/svelte';
	import { DEFAULT_COUNTRIES } from '$lib/const';
	import Form from './Form.svelte';
	import { cn } from '$lib/utils';
	import type { SuperValidated } from 'sveltekit-superforms';

	interface Props {
		form: SuperValidated<T>;
	}

	let { form }: Props = $props();

	interface Item {
		id: number;
		country: string;
	}

	// Convert countries to items for dnd
	let items: Item[] = $state(DEFAULT_COUNTRIES);

	// Handle DND events
	function handleDndConsider(e: CustomEvent<DndEvent<Item>>) {
		items = e.detail.items;
	}

	function handleDndFinalize(e: CustomEvent<DndEvent<Item>>) {
		items = e.detail.items;
	}

	// Country classes
	const countryClassMap: Record<string, string> = {
		Austria: 'bg-red-200 text-black dark:border-red-800',
		England: 'bg-blue-200 text-black dark:border-blue-800',
		France: 'bg-sky-200 text-black dark:border-sky-800',
		Germany: 'bg-gray-200 text-black dark:border-gray-800',
		Italy: 'bg-green-200 text-black dark:border-green-800',
		Russia: 'bg-purple-200 text-black dark:border-purple-800',
		Turkey: 'bg-yellow-200 text-black dark:border-yellow-800'
	};

	const grabIconClassMap: Record<string, string> = {
		Austria: 'text-rose-800 dark:text-rose-200',
		England: 'text-indigo-800 dark:text-indigo-200',
		France: 'text-blue-800 dark:text-blue-200',
		Germany: 'text-stone-800 dark:text-stone-300',
		Italy: 'text-green-800 dark:text-green-200',
		Russia: 'text-purple-800 dark:text-purple-200',
		Turkey: 'text-yellow-800 dark:text-yellow-100'
	};
</script>

<Form dataType="json" data={form} let:superform let:delayed>
	<div
		use:dndzone={{ items, flipDurationMs: 150 }}
		onconsider={(e: CustomEvent) => handleDndConsider(e)}
		onfinalize={(e: CustomEvent<DndEvent<Item>>) => {
			handleDndFinalize(e);
			superform.form.update(($form) => {
				$form.preferences = e.detail.items.map((item, index) => ({
					rank: index + 1,
					country: item.country
				}));

				return $form;
			});
		}}
		class="border-border bg-card mb-6 rounded-lg border py-2"
	>
		{#each items as item (item.id)}
			<div
				animate:flip={{ duration: 150 }}
				class={cn(
					'mx-2 my-1 flex cursor-grab items-center rounded-lg border-2 border-black hover:scale-[1.01]',
					countryClassMap[item.country]
				)}
			>
				<div class={cn('flex-shrink-0 p-3 text-black')}>
					<GripVertical size={18} />
				</div>
				<div class="flex-grow p-3">
					<span class="font-semibold">{item.country}</span>
				</div>
			</div>
		{/each}
	</div>

	<div class="flex justify-center">
		<button
			type="submit"
			class="bg-primary text-primary-foreground hover:bg-primary/95 rounded-md px-6 py-2 hover:cursor-pointer disabled:pointer-events-none disabled:opacity-50"
			disabled={delayed}
		>
			{#if delayed}
				Submitting...
			{:else}
				Submit Preferences
			{/if}
		</button>
	</div>
</Form>
