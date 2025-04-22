<!-- src/routes/start/+page.svelte -->
<script lang="ts">
	import Banner from '$lib/components/Banner.svelte';
	import Form from '$lib/components/Form.svelte';
	import TextField from '$lib/components/TextField.svelte';

	let { data } = $props();
</script>

<Banner />

<div class="mx-auto max-w-md">
	<div class="mb-8 text-center">
		<h1 class="mb-2 text-2xl font-bold">Welcome to dipch</h1>
		<p class="text-muted-foreground">Please enter your player code to continue</p>
	</div>

	<div class="mx-auto max-w-64">
		<Form data={data.form} let:superform>
			<TextField type="text" {superform} field="code" placeholder="Enter player code" />
			<button
				type="submit"
				class="bg-primary text-primary-foreground hover:bg-primary/95 focus:ring-primary/50 w-full rounded-md px-4 py-2 hover:cursor-pointer focus:ring-2 focus:outline-none"
			>
				Continue
			</button>
		</Form>
	</div>
</div>
