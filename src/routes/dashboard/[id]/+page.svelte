<script lang="ts">
	import { add as addToast } from '$lib/stores/Toasts';
    import ConfigView from '$lib/components/dashboard/ConfigView.svelte'
    import Button from '$lib/components/ui/Button.svelte';
    import { add as addConfig, configurations, set as setConfigs } from '$lib/stores/Configurations';

    export let data: import('./$types').PageData
	setConfigs( data.wikis )

	const add = () => {
		addConfig( {
			channel: data.channels.at( 0 )?.id ?? '',
			color: 0x0088ff,
			remove: false,
			wiki: ''
		} )
	}

	let isSaving = false
	const save = async () => {
		if ( isSaving ) return
		isSaving = true

		const maxItems = Math.max( data.wikis.length, $configurations.length )
		for ( let i = 0; i < maxItems; i++ ) {
			const stored = data.wikis.at( i )
			const newSettings = $configurations.at( i )

			if ( !newSettings ) continue
			if ( !stored && !newSettings.remove ) {
				const req = await fetch( '/api/configurations', {
					body: JSON.stringify( {
						...newSettings,
						guild: data.guildId
					}, ( _, v ) => v || undefined ),
					headers: {
						'content-type': 'application/json'
					},
					method: 'POST'
				} )
				if ( req.status === 200 ) {
					addToast( { text: `${ newSettings.wiki } has been registered successfully.`, type: 'success' } )
				} else {
					addToast( { text: `There was an error while trying to register ${ newSettings.wiki }.`, type: 'danger' } )
				}
				continue
			} else if ( !stored ) {
				continue
			} else if ( newSettings.remove ) {
				const req = await fetch( '/api/configurations', {
					body: JSON.stringify( {
						guild: data.guildId,
						wiki: stored.wiki
					} ),
					headers: {
						'content-type': 'application/json'
					},
					method: 'DELETE'
				} )
				if ( req.status === 200 ) {
					addToast( { text: `${ newSettings.wiki } has been removed successfully.`, type: 'success' } )
				} else {
					addToast( { text: `There was an error while trying to remove ${ newSettings.wiki }.`, type: 'danger' } )
				}
				continue
			} else if ( stored.wiki !== newSettings.wiki ) {
				addToast( { text: `You can't change the wiki of an existing configuration. Please, remove it and add a new one instead.`, type: 'warn' } )
				newSettings.wiki = stored.wiki
				continue
			}

			let prop: keyof typeof stored
			for ( prop in stored ) {
				const storedValue = stored[ prop ]
				const newValue = newSettings[ prop ]
				if ( storedValue !== newValue ) {
					const req = await fetch( '/api/configurations', {
						body: JSON.stringify( {
							...newSettings,
							guild: data.guildId,
							update: true
						}, ( _, v ) => v ?? undefined ),
						headers: {
							'content-type': 'application/json'
						},
						method: 'POST'
					} )
					if ( req.status === 200 ) {
						addToast( { text: `The configuration for ${ newSettings.wiki } has been updated successfully.`, type: 'success' } )
					} else {
						addToast( { text: `There was an error while trying to update ${ newSettings.wiki }.`, type: 'danger' } )
					}
					break
				}
			}
		}
		
		setConfigs( $configurations.filter( i => !i.remove ) )
		isSaving = false
	}
</script>

<svelte:head>
	<title> Dashboard - Arlecchino </title>
</svelte:head>

<main class="container">
	{ #each $configurations as config, idx }
		<ConfigView channels={ data.channels } config={ config } idx={ idx } />
	{ /each }

	<Button text="Register new wiki" css={ {
		display: 'block',
		'margin-top': '16px',
		'text-align': 'center',
		width: '100%'
	} } onClick={ add } type="success" disabled={ $configurations.length >= data.limit } />

	<Button text="Save changes" css={ {
			display: 'block',
			'margin-top': '16px',
			'text-align': 'center',
			width: '100%'
		} } onClick={ save } />
</main>

<style>
.container {
	margin: 0 auto;
	padding-bottom: 20px;
	width: 80%;
}
</style>