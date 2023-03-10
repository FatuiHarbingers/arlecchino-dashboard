import { add as addToast } from '$lib/stores/Toasts'
import type { ProfileStore, ProfileType } from '$lib/stores/Profiles'
import { trpc } from '$lib/trpc/client'

export const saveRemovedProfiles = async ( store: ProfileStore, guildId: string ) => {
	const promises: Promise<{
		error: unknown | null
		type: ProfileType
		wiki: string
	}>[] = []

	for ( const profiles of Object.values( store ) ) {
		for ( const profile of profiles ) {
			if ( !profile.remove || !profile._original ) continue

			const req = trpc().profiles.remove.query( {
				guild: guildId,
				type: profile.type,
				wiki: profile.wiki
			} )
				.then( () => ( { error: null, type: profile.type, wiki: profile.wiki } ) )
				.catch( e => ( { error: e, type: profile.type, wiki: profile.wiki } ) )
			promises.push( req )
		}
	}

	if ( promises.length === 0 ) return
	const settled = await Promise.allSettled( promises )

	for ( const result of settled ) {
		if ( result.status === 'fulfilled' ) {
			if ( result.value.error ) {
				addToast( {
					text: `There was an error while trying to remove profile ${ result.value.type } in ${ result.value.wiki }.`,
					type: 'danger'
				} )
			} else {
				addToast( {
					text: `Profile ${ result.value.type } in ${ result.value.wiki } was removed successfully.`,
					type: 'success'
				} )
			}
		} else {
			addToast( {
				text: `There was an error while trying to remove one of the profiles.`,
				type: 'danger'
			} )
		}
	}
}
