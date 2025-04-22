<script lang="ts" module>
	type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { toasts } from '$lib/stores/toast';

	export let data: SuperValidated<T>;
	export let dataType: 'form' | 'json' = 'form';
	export let invalidateAll: boolean = true;
	export let showToasts: boolean = true;
	export let multipleSubmits: 'prevent' | 'allow' | 'abort' = 'prevent';

	export const superform = superForm(data, {
		dataType,
		invalidateAll,
		multipleSubmits,
		onUpdated({ form }) {
			if (form.message && showToasts) {
				if (form.message.status >= 200 && form.message.status < 300) {
					toasts.success(form.message.text);
				} else if (form.message.status >= 400) {
					toasts.error(form.message.text);
				} else {
					toasts.info(form.message.text);
				}
			}
		},
		onError({ result }) {
			if (showToasts) {
				toasts.error(result.error?.message || 'An unexpected error occurred');
			}
		}
	});

	const { form, message, delayed, errors, allErrors, enhance } = superform;
</script>

<form method="POST" use:enhance {...$$restProps}>
	<slot
		{superform}
		form={$form}
		message={$message}
		errors={$errors}
		allErrors={$allErrors}
		delayed={$delayed}
	/>
</form>

{#if import.meta.env.DEV && import.meta.env.VITE_SUPER_DEBUG === 'true'}
	<SuperDebug data={$form}></SuperDebug>
{/if}
