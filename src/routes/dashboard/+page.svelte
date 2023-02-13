<script lang="ts">
	import type { APIGuild } from 'discord-api-types/v10'
    import GuildView from '$lib/components/dashboard/GuildView.svelte'
    import { browser } from '$app/environment';
    import type { Awaitable } from 'discord.js';

	export let data: import( './$types' ).PageData

	const guilds: Awaitable<{ guilds: ( APIGuild & { hasBot: boolean } )[] }> = browser
		? fetch( '/api/guilds' )
			.then( r => r.json() )
		: { guilds: [] }
</script>

<svelte:head>
	<title> Dashboard - Arlecchino </title>
</svelte:head>

<div class="guilds">
	{ #await guilds }
		<p> Loading your guilds... </p>
	{ :then result } 
		{ #each result.guilds as guild }
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