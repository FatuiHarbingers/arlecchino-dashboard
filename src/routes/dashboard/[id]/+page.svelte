<script lang="ts">
	import { add as addToast } from '$lib/stores/Toasts';
    import ConfigView from '$lib/components/dashboard/ConfigView.svelte'
    import Button from '$lib/components/ui/Button.svelte';

    export let data: import('./$types').PageData
	let customSettings = data.wikis.map( i => ( { ...i, remove: false } ) )

	const add = () => {
		customSettings.push( {
			channel: data.channels.at( 0 )?.id ?? '',
			color: 0x0088ff,
			remove: false,
			wiki: ''
		} )
		customSettings = customSettings
	}

	let isSaving = false
	const save = async () => {
		if ( isSaving ) return
		isSaving = true

		const maxItems = Math.max( data.wikis.length, customSettings.length )
		for ( let i = 0; i < maxItems; i++ ) {
			const stored = data.wikis.at( i )
			const newSettings = customSettings.at( i )

			if ( !newSettings ) continue
			if ( !stored && !newSettings.remove ) {
				const req = await fetch( '/api/configurations', {
					body: JSON.stringify( newSettings, ( _, v ) => v || undefined ),
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
						body: JSON.stringify( { ...newSettings, update: true }, ( _, v ) => v ?? undefined ),
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
		
		customSettings = customSettings.filter( i => !i.remove )
		data.wikis = customSettings.map( i => ( { ...i } ) )
		isSaving = false
	}
</script>

<svelte:head>
	<title> Dashboard - Arlecchino </title>
</svelte:head>

<main class="container">
	{ #each customSettings as config }
		<ConfigView channels={ data.channels } config={ config } />
	{ /each }

	<Button text="Register new wiki" css={ {
		display: 'block',
		'margin-top': '16px',
		'text-align': 'center',
		width: '100%'
	} } onClick={ add } type="success" disabled={ customSettings.length >= data.limit } />

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