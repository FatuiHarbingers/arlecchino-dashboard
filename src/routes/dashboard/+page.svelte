<script lang="ts">
    import GuildView from '$lib/components/dashboard/GuildView.svelte'


    export let data: import('./$types').PageData
</script>

<svelte:head>
	<title> Dashboard - Arlecchino </title>
</svelte:head>

<div class="guilds">
	{ #each data.guilds as guild }
		<GuildView clientId="1071136383407759541" guild={ guild } />
	{ /each }
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