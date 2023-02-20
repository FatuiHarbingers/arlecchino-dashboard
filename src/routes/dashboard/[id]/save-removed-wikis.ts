import { add as addToast } from '$lib/stores/Toasts'
import type { Configuration, ConfigurationStore } from '$lib/stores/Configurations'

export const saveRemovedWikis = async ( configurations: ConfigurationStore, guildId: string ) => {
	const promises: Promise<{
		error: unknown | null
		wiki: string
	}>[] = []
	for ( const [ interwiki, config ] of Object.entries( configurations ) ) {
		if ( !config.remove || !config._original ) continue

		const req = fetch( `/api/configurations`, {
			body: JSON.stringify( {
				guild: guildId,
				wiki: interwiki
			} ),
			headers: {
				'content-type': 'application/json'
			},
			method: 'DELETE'
		} )
			.then( () => ( { error: null, wiki: interwiki } ) )
			.catch( e => ( { error: e, wiki: interwiki } ) )
		promises.push( req )
	}

	if ( promises.length === 0 ) return
	const settled = await Promise.allSettled( promises )
	for ( const result of settled ) {
		if ( result.status === 'fulfilled' ) {
			if ( result.value.error ) {
				addToast( {
					text: `There was an error while trying to remove ${ result.value.wiki }.`,
					type: 'danger'
				} )
			} else {
				addToast( {
					text: `${ result.value.wiki } was removed successfully.`,
					type: 'success'
				} )
			}
		} else {
			addToast( {
				text: `There was an error while trying to remove one of the wikis.`,
				type: 'danger'
			} )
		}
	}
}
