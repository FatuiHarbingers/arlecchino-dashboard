import { add as addToast } from '$lib/stores/Toasts'
import type { Profile_type } from '@prisma/client'
import type { ProfileStore } from '$lib/stores/Profiles'
import { trpc } from '$lib/trpc/client'

export const saveUpdatedProfiles = async ( store: ProfileStore, guildId: string ) => {
	const promises: Promise<{
		error: unknown | null
		type: Profile_type
		wiki: string
	}>[] = []

	for ( const profiles of Object.values( store ) ) {
		for ( const profile of profiles ) {
			if ( profile.remove || !profile._original ) continue
			if ( profile.avatar === profile._original.avatar
				&& profile.color === profile._original.color
				&& profile.name === profile._original.name ) continue

			const { avatar, color, name, type, wiki} = profile

			const req = trpc().profiles.create.query( {
				avatar: avatar ?? undefined,
				color: color ?? undefined,
				guild: guildId,
				name: name ?? undefined,
				type,
				wiki
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
					text: `There was an error while trying to update profile ${ result.value.type } for ${ result.value.wiki }.`,
					type: 'danger'
				} )
			} else {
				addToast( {
					text: `Profile ${ result.value.type } in ${ result.value.wiki } was updated successfully.`,
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
