<script lang="ts" context="module">
	type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
	import { cn } from '$lib/utils';

	import { formFieldProxy } from 'sveltekit-superforms';
	import type { SuperForm, FormPathLeaves } from 'sveltekit-superforms';

	export let label = '';
	export let field: FormPathLeaves<T>;
	export let superform: SuperForm<T>;

	const { value, errors, constraints } = formFieldProxy(superform, field);
</script>

{#if label}
	<label class="mb-2 block text-sm font-medium" for={field}>{label}</label>
{/if}
<div class="mb-2">
	<input
		class={cn(
			'placeholder:text-muted-foreground focus:ring-ring w-full rounded-lg border bg-transparent p-2 focus:ring-1 focus:outline-none'
		)}
		name={field}
		aria-invalid={$errors ? 'true' : undefined}
		placeholder=""
		bind:value={$value}
		{...$constraints}
		{...$$restProps}
	/>
</div>
{#if $errors}
	<p class="mt-1 text-sm text-red-600">{$errors[0]}</p>
{/if}
