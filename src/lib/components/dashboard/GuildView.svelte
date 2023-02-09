<script lang="ts">
	import type { APIGuild } from 'discord-api-types/v10'
	import { page } from '$app/stores'

	export let clientId: string
	export let guild: APIGuild & { hasBot: boolean }

	let href = guild.hasBot
		? `/dashboard/${ guild.id }`
		: `https://discord.com/api/oauth2/authorize?response_type=code&client_id=${ clientId }&permissions=378494307392&scope=bot&guild_id=${ guild.id }&disable_guild_select=true&redirect_uri=${ $page.url }`
</script>

<a class="guild-view { !guild.hasBot && 'gv__invite' }" href={ href }>
	<div class="gv__icon">
		{ #if guild.icon }
			<img src="https://cdn.discordapp.com/icons/{ guild.id }/{ guild.icon }.png" width="128" alt="guild icon" />
		{ :else }
			<div> { guild.name.charAt( 0 ) } </div>
		{ /if }
	</div>
	<div class="gv__name"> { guild.name } </div>
</a>

<style>
.guild-view {
	color: inherit;
	display: flex;
	flex-direction: column;
	text-align: center;
	text-decoration: none;
	width: 128px;
}
.guild-view:hover {
	text-decoration: underline;
}
.gv__invite {
	filter: grayscale( 1 )
}
.gv__icon img {
	border-radius: 100%;
}
.gv__icon div {
	align-items: center;
	background-color: rgba( 0, 0, 0, 0.3 );
	border-radius: 100%;
	display: flex;
	height: 128px;
	justify-content: center;
	width: 128px;
}
.gv__name {
	font-size: 0.85em;
	margin-top: 8px;
	padding: 0 4px;
}
</style>