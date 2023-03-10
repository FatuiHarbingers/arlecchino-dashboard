<script lang="ts">
    import { browser } from '$app/environment';
    import { page } from '$app/stores';
    import Config from '$lib/components/dashboard/Config.svelte';
    import Dropdown from '$lib/components/forms/Dropdown.svelte';
    import TextInput from '$lib/components/forms/TextInput.svelte';
    import Button from '$lib/components/ui/Button.svelte';
	import { configurations, getConfiguration, type Configuration, type ConfigurationStore } from '$lib/stores/Configurations';
    import { profiles, type ProfileStore } from '$lib/stores/Profiles';
    import { add as addToast } from '$lib/stores/Toasts';
    import { trpc } from '$lib/trpc/client';
    import { SnowflakeValidator } from '@arlecchino/api';
    import { saveNewProfiles } from './save-new-profiles';
    import { saveNewWikis } from './save-new-wikis';
    import { saveRemovedProfiles } from './save-removed-profiles';
    import { saveRemovedWikis } from './save-removed-wikis';
    import { saveUpdatedProfiles } from './save-updated-profiles';
    import { saveUpdatedWikis } from './save-updated-wikis';

    export let data: import('./$types').PageData
	const t = trpc($page)

	configurations.update( store => {
		store = data.wikis.map( ( { wiki, ...body } ) => {
			return {
				_original: body,
				...body,
				remove: false,
				wiki
			}
		} ).reduce( ( list, { wiki, ...item } ) => {
			list[ wiki ] = item
			return list
		}, {} as Record<string, Configuration> )
		return store
	} )

	let profilesLoaded = false

	const loadProfiles = ( profilesData: Awaited<ReturnType<typeof t[ 'profiles' ][ 'list' ][ 'query' ]>> ) => {
		profiles.update( store => {
			for ( const profile of profilesData ) {
				const wiki = store[ profile.wiki ] ?? []
				store[ profile.wiki ] ??= wiki

				wiki.push( {
					_original: profile,
					...profile
				} )
			}
			return store
		} )
		profilesLoaded = true
	}

	if ( browser ) {
		t.profiles.list.query( { guild: data.guildId } )
			.then( loadProfiles )
	}

	const addWiki = ( e: unknown ) => {
		const error = document.getElementById( 'interwikiError' ) ?? { innerText: '' }
		error.innerText = ''
		
		const event = e as EventTarget & { currentTarget: EventTarget & HTMLElement }
		const input = event.currentTarget.previousElementSibling
		if ( !( input instanceof HTMLInputElement ) ) return
		
		const value = input.value.trim()
		try {
			const url = new URL( value )
			let wiki: string
			if ( url.pathname.includes( '/wiki/' ) ) {
				const from = url.pathname.search( '/wiki/' )
				url.pathname = url.pathname.substring( 0, from + 1 )
				wiki = new URL( './api.php', url ).href
			} else if ( url.pathname.includes( '/w/' ) ) {
				const from = url.pathname.search( '/w/' )
				url.pathname = url.pathname.substring( 0, from + 3 )
				wiki = new URL( './api.php', url ).href
			} else if ( url.pathname.match( /^\/[a-z-]{2,5}$/ ) ) {
				url.pathname += '/'
				wiki = new URL( './api.php', url ).href
			} else {
				wiki = new URL( '/api.php', url ).href
			}

			if ( $configurations[ wiki ] ) {
				error.innerText = 'This wiki is already in your follow list.'
				return
			}

			getConfiguration( $configurations, wiki )
		} catch {
			error.innerText = 'You must enter a valid wiki URL.'
		}
	}

	let isSaving = false
	const saveChanges = async () => {
		if ( isSaving ) {
			addToast( {
				text: `Your changes are already being saved. Please wait...`,
				type: 'warn'
			} )
			return
		}
		isSaving = true
		addToast( {
			text: `Your changes are being saved.`,
			type: 'info'
		} )

		await saveNewWikis( $configurations, data.guildId )
		await saveRemovedWikis( $configurations, data.guildId )
		await saveUpdatedWikis( $configurations, data.guildId )

		await saveNewProfiles( $profiles, data.guildId )
		await saveRemovedProfiles( $profiles, data.guildId )
		await saveUpdatedProfiles( $profiles, data.guildId )

		configurations.update( () => {
			const store: ConfigurationStore = {}

			for ( const [ interwiki, config ] of Object.entries( $configurations ) ) {
				if ( config.remove ) continue

				store[ interwiki ] = {
					_original: {
						channel: config.channel
					},
					channel: config.channel
				}
			}

			return store
		} )

		profiles.update( () => {
			const store: ProfileStore = {}

			for ( const list of Object.values( $profiles ) ) {
				for ( const { avatar, color, name, remove, type, wiki } of list ) {
					if ( remove ) continue

					store[ wiki ] ??= []
					store[ wiki ].push( {
						_original: { avatar, color, name, type, wiki },
						avatar, color, name, type, wiki
					} )
				}
			}

			return store
		} )

		addToast( {
			text: `All of your changes have been processed.`,
			type: 'success'
		} )
		isSaving = false
	}

	let isFollowing = false
	const saveFollow = async ( e: unknown ) => {
		if ( isFollowing ) {
			addToast( {
				text: `Your request is already being processed.`,
				type: 'warn'
			} )
			return
		}
		isFollowing = true

		const event = e as EventTarget & { currentTarget: EventTarget & HTMLElement }
		const dropdown = event.currentTarget.previousElementSibling
		if ( !( dropdown instanceof HTMLSelectElement ) ) return
		
		const value = dropdown.value.trim()
		const snowflake = SnowflakeValidator.run( value )

		if ( dropdown.value.length === 0 || snowflake.isErr() ) {
			addToast( {
				text: `The channel seems to be wrong.`,
				type: 'danger'
			} )
			return
		}
		
		try {
			await trpc( $page ).announcements.query( {
				channel: snowflake.unwrap(),
				guild: data.guildId
			} )
			
			addToast( {
				text: `You are now following my announcements channel!`,
				type: 'success'
			} )
		} catch {
			addToast( {
				text: `There was an error with your request.`,
				type: 'danger'
			} )
		}

		isFollowing = false
	}
</script>

<svelte:head>
	<title> Dashboard - Arlecchino </title>
</svelte:head>

<main class="container">
	<div class="container__box">
		Don't miss any news! Follow my announcements channel.

		<div class="form-control">
			<Dropdown>
				{ #each data.channels as channel }
					<option value="{ channel.id }"> #{ channel.name } </option>
				{ /each }
			</Dropdown>
			<Button text="Follow" onClick={ saveFollow } />
		</div>
	</div>

	<div class="container__box">
		You are currently following <b>{ Object.keys( $configurations ).length }</b> wikis, and your limit is <b>{ data.limit }.</b>

		<div class="form-control">
			{ #if Object.keys( $configurations ).length < data.limit }
				<TextInput placeholder="Enter an interwiki" />
				<Button text="Add" onClick={ addWiki } />
				<span id="interwikiError"></span>
			{ :else }
				<TextInput placeholder="Can't add more wikis" disabled={ true } />
				<Button text="Add" disabled={ true } />
			{ /if }
			<div class="form-control__gap"></div>
			<Button text="Save changes" type="success" onClick={ saveChanges } />
		</div>
	</div>

	{ #each Object.keys( $configurations ) as api }
		<Config channels={ data.channels } api={ api } ready={ profilesLoaded } />
	{ /each }
</main>

<style>
.container {
	margin: 0 auto;
	padding-bottom: 20px;
	width: 80%;
}
.container__box {
	background-color: #0a0e12;
	border-radius: 5px;
	margin: 16px 0;
	padding: 16px;
}
.form-control {
	align-items: center;
	column-gap: 8px;
	display: flex;
	margin-top: 16px;
}
#interwikiError {
	color: #c62828;
}
.form-control__gap {
	flex-grow: 1;
}
</style>