<script lang="ts">
    import GuildView from '$lib/components/dashboard/GuildView.svelte'
    import { trpc } from '$lib/trpc/client';
    import { page } from '$app/stores';

	export let data: import( './$types' ).PageData

	const guilds = trpc($page).guilds.list.query()
</script>

<svelte:head>
	<title> Dashboard - Arlecchino </title>
</svelte:head>

<div class="guilds">
	{ #await guilds }
		<p> Loading your guilds... </p>
	{ :then result } 
		{ #each result as guild }
			<GuildView clientId={ data.clientId } guild={ guild } />
		{ /each }
	{ /await }
</div>

<style>
.guilds {
	column-gap: 16px;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	margin-top: 32px;
	row-gap: 16px;
}
</style>