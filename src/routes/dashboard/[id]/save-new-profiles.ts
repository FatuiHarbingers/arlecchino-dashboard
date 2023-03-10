import { add as addToast } from '$lib/stores/Toasts'
import type { ProfileStore, ProfileType } from '$lib/stores/Profiles'
import { trpc } from '$lib/trpc/client'


export const saveNewProfiles = async ( store: ProfileStore, guildId: string ) => {
	const promises: Promise<{
		error: unknown | null
		type: ProfileType
		wiki: string
	}>[] = []

	for ( const profiles of Object.values( store ) ) {
		for ( const profile of profiles ) {
			if ( profile._original || profile.remove ) continue
			
			if ( Object.keys( profile ).length === 0 ) {
				addToast( {
					text: `You must set at least one of the properties to be able to save profile ${ profile.type } for ${ profile.wiki }.`,
					type: 'warn'
				} )
				continue
			}

			const req = trpc().profiles.create.query( {
				avatar: profile.avatar ?? undefined,
				color: profile.color ?? undefined,
				guild: guildId,
				name: profile.name ?? undefined,
				type: profile.type,
				wiki: profile.wiki
			} )
				.then( () => ( { error: null, type: profile.type, wiki: profile.wiki } ) )
				.catch( e => ( { error: e, type: profile.type, wiki: profile.wiki } ) )
			promises.push( req )
		}
	}

	const settled = await Promise.allSettled( promises )
	for ( const item of settled ) {
		if ( item.status === 'rejected' ) {
			addToast( {
				text: `There was an error while trying to register one of your profiles, please try again later.`,
				type: 'danger'
			} )
		} else if ( item.value.error ) {
			addToast( {
				text: `There was an error while trying to register profile ${ item.value.type } for ${ item.value.wiki }.`,
				type: 'danger'
			} )
		} else {
			addToast( {
				text: `Profile ${ item.value.type } in ${ item.value.wiki } was registered successfully.`,
				type: 'success'
			} )
		}
	}
}
