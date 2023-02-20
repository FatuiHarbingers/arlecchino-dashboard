import { add as addToast } from '$lib/stores/Toasts'
import type { ConfigurationStore } from '$lib/stores/Configurations'

export const saveNewWikis = async ( configurations: ConfigurationStore, guildId: string ) => {
	const promises: Promise<{
		error: unknown | null
		wiki: string
	}>[] = []

	for ( const [ interwiki, config ] of Object.entries( configurations ) ) {
		if ( config._original || config.remove ) continue
		if ( config.channel.length === 0 ) {
			addToast( {
				text: `You must select a channel for ${ interwiki }.`,
				type: 'warn'
			} )
			continue
		}

		const req = fetch( `/api/configurations`, {
			body: JSON.stringify( {
				channel: config.channel,
				guild: guildId,
				wiki: interwiki
			} ),
			headers: {
				'content-type': 'application/json'
			},
			method: 'POST'
		} )
			.then( res => {
				if ( res.status >= 400 ) throw new Error()
				return { error: null, wiki: interwiki }
			} )
			.catch( ( e: unknown ) => {
				return { error: e, wiki: interwiki }
			} )
		promises.push( req )
	}

	const settled = await Promise.allSettled( promises )
	for ( const item of settled ) {
		if ( item.status === 'rejected' ) {
			addToast( {
				text: `There was an error while trying to register one of your wikis, please try again later.`,
				type: 'danger'
			} )
		} else if ( item.value.error ) {
			addToast( {
				text: `There was an error while trying to register ${ item.value.wiki }.`,
				type: 'danger'
			} )
		} else {
			addToast( {
				text: `${ item.value.wiki } was registered successfully.`,
				type: 'success'
			} )
		}
	}
}
