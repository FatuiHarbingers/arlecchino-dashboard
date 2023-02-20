import { add as addToast } from '$lib/stores/Toasts'
import { profileTypeString, type ProfileStore } from '$lib/stores/Profiles'
import type { ProfileType } from '@arlecchino/api'

export const saveUpdatedProfiles = async ( store: ProfileStore, guildId: string ) => {
	const promises: Promise<{
		error: unknown | null
		type: ProfileType
		wiki: string
	}>[] = []

	for ( const profiles of Object.values( store ) ) {
		for ( const profile of profiles ) {
			if ( profile.remove || !profile._original ) continue
			if ( profile.avatar === profile._original.avatar
				&& profile.color === profile._original.color
				&& profile.name === profile._original.name ) continue

			const { avatar, color, name, type, wiki} = profile

			const req = fetch( `/api/profiles`, {
				body: JSON.stringify( {
					avatar,
					color,
					guild: guildId,
					name,
					type,
					wiki
				} ),
				headers: {
					'content-type': 'application/json'
				},
				method: 'POST'
			} )
				.then( res => {
					console.log( res )
					return { error: null, type: profile.type, wiki: profile.wiki }
				} )
				.catch( e => ( { error: e, type: profile.type, wiki: profile.wiki } ) )
			promises.push( req )
		}
	}

	if ( promises.length === 0 ) return
	const settled = await Promise.allSettled( promises )

	for ( const result of settled ) {
		console.log( result )
		if ( result.status === 'fulfilled' ) {
			if ( result.value.error ) {
				addToast( {
					text: `There was an error while trying to update profile ${ profileTypeString[ result.value.type ] } for ${ result.value.wiki }.`,
					type: 'danger'
				} )
			} else {
				addToast( {
					text: `Profile ${ profileTypeString[ result.value.type ] } in ${ result.value.wiki } was updated successfully.`,
					type: 'success'
				} )
			}
		} else {
			addToast( {
				text: `There was an error while trying to update one of the profiles.`,
				type: 'danger'
			} )
		}
	}
}
