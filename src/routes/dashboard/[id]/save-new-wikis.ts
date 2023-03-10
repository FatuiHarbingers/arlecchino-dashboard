import { add as addToast } from '$lib/stores/Toasts'
import type { ConfigurationStore } from '$lib/stores/Configurations'
import { trpc } from '$lib/trpc/client'

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

		const req = trpc().configurations.create.query( {
			channel: config.channel,
			guild: guildId,
			update: false,
			wiki: interwiki
		} )
			.then( () => {
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
