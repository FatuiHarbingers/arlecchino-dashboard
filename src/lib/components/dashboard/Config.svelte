<script lang="ts">
    import { configurations, getConfiguration } from "$lib/stores/Configurations";
    import { getProfile, profiles, type ProfileType, profileTypes, type Profile } from "$lib/stores/Profiles";
    import type { APIChannel } from "discord.js";
    import Dropdown from "../forms/Dropdown.svelte";
    import Button from "../ui/Button.svelte";
    import ConfigProfile from "./ConfigProfile.svelte";

	export let channels: APIChannel[]
	export let api: string
	export let ready: boolean

	$: config = getConfiguration( $configurations, api )

	const baseUrl = api.replace( /(\/w(iki)?)?\/api.php/, '' )

	let profileList: Profile[] = []
	let missingProfiles: ProfileType[] = []
	$: {
		profileList = getProfile( $profiles, api )
		missingProfiles = profileTypes.filter( p => !profileList.find( i => i.type === p ) )
	}

	const addProfile = ( e: unknown ) => {
		const event = e as EventTarget & { currentTarget: EventTarget & HTMLButtonElement }
		const dropdown = event.currentTarget.previousElementSibling
		if ( !( dropdown instanceof HTMLSelectElement ) ) return

		const type = dropdown.value as ProfileType
		if ( !profileTypes.includes( type ) ) return

		getProfile( $profiles, api, type )
	}

	const clickRemove = () => {
		config.remove = !config.remove
		configurations.update( list => {
			list[ api ] = config
			return list
		} )
	}

	const changeChannel = ( e: unknown ) => {
		const event = e as EventTarget & { currentTarget: EventTarget & HTMLSelectElement }
		config.channel = event.currentTarget.value
		configurations.update( list => {
			list[ api ] = config
			return list
		} )
	}
</script>
<div class="config { config.remove ? 'config--remove' : '' }">
	<div class="config__top">
		<div class="config__link">
			<a class="config__url" href={ baseUrl }>
				{ baseUrl }
			</a>
		</div>

		<div class="config__remove">
			<Button text="&times;" type="danger" style="smooth" onClick={ clickRemove } />
		</div>

		<div class="config__dropdown">
			<Dropdown value={ $configurations[ api ].channel } width="100%" onChange={ changeChannel }>
				{ #each channels as channel }
					<option value={ channel.id }> #{ channel.name } </option>
				{ /each }
			</Dropdown>
		</div>
	</div>

	{ #if ready }
		<div class="config__profile-button">
			{ #if missingProfiles.length > 0 }
				<label for="profileType"> Add a new profile </label>
				<Dropdown value={ missingProfiles.at( 0 )?.toString() }>
					{ #each missingProfiles as profileType }
						<option value={ profileType.toString() }> { profileType } </option>
					{ /each }
				</Dropdown>
				<Button text="Add" onClick={ addProfile } />
			{ :else }
				<p> There aren't more profiles you can add. </p>
				<Button text="Add" disabled={ true } />
			{ /if }
		</div>

		{ #each profileList as profile }
			<ConfigProfile interwiki={ profile.wiki } type={ profile.type } />
		{ /each }
	{ :else }
		<p> Please wait while we load the profiles you have already configured... </p>
	{ /if }
</div>

<style>
.config {
	background-color: #0a0e12;
	border-radius: 4px;
	display: flex;
	flex-wrap: wrap;
	margin: 16px 0;
	padding: 16px;
}
.config--remove {
	background: rgb(231, 54, 44, 0.1);
}
.config__top {
	border-bottom: 1px solid #0095ae;
	display: flex;
	flex-basis: 100%;
	flex-wrap: wrap;
	margin-bottom: 16px;
	padding-bottom: 16px;
	row-gap: 16px;
}
.config__link {
	flex-grow: 1;
}
.config__url {
	color: inherit;
	text-decoration: none;
}
.config__url:hover {
	color: #fff;
}
.config__dropdown {
	flex-basis: 100%;
}
.config__profile-button {
	align-items: center;
	column-gap: 16px;
	display: flex;
}
</style>