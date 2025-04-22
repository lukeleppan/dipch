<script lang="ts">
	import '../app.css';
	import ogImage from '$lib/images/banner.webp';
	import Toast from '$lib/components/Toast.svelte';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>dipch</title>
	<meta name="description" content="The Diplomacy Country Assignment Tool!" />
	<meta property="og:url" content="https://dipch.lukeleppan.com/" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="dipch" />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:alt" content="dipch banner" />
	<meta property="og:description" content="The Diplomacy Country Assignment Tool!" />
	<meta property="og:site_name" content="dipch" />
	<meta property="og:locale" content="en_US" />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<Toast />

	<Header />

	<main class="mx-auto mt-6 w-full max-w-4xl flex-1 px-4 sm:px-6">
		{@render children()}
	</main>

	<Footer />
</div>
