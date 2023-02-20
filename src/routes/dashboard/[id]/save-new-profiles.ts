import { add as addToast } from '$lib/stores/Toasts'
import { profileTypeString, type ProfileStore } from '$lib/stores/Profiles'
import { s } from '@sapphire/shapeshift'
import type { ProfileType } from '@arlecchino/api'

export const saveNewProfiles = async ( store: ProfileStore, guildId: string ) => {
	const promises: Promise<{
		error: unknown | null
		type: ProfileType
		wiki: string
	}>[] = []

	const validator = s.object( {
		avatar: s.string.url().optional,
		color: s.number.greaterThanOrEqual( 0 ).lessThanOrEqual( 0xffffff ).optional,
		name: s.string.lengthGreaterThan( 0 ).optional
	} ).ignore

	for ( const profiles of Object.values( store ) ) {
		for ( const profile of profiles ) {
			if ( profile._original || profile.remove ) continue
			
			const result = validator.run( profile )
			console.log( result )
			if ( result.isErr() ) {
				addToast( {
					text: `Some of the values aren't valid in your settings for profile ${ profileTypeString[ profile.type ] } in ${ profile.wiki }.`,
					type: 'danger'
				} )
				continue
			} else if ( Object.keys( result.unwrap() ).length === 0 ) {
				addToast( {
					text: `You must set at least one of the properties to be able to save profile ${ profileTypeString[ profile.type ] } for ${ profile.wiki }.`,
					type: 'warn'
				} )
				continue
			}

			const req = fetch( `/api/profiles`, {
				body: JSON.stringify( {
					...result.unwrap(),
					guild: guildId,
					type: profile.type,
					wiki: profile.wiki
				} ),
				headers: {
					'content-type': 'application/json'
				},
				method: 'POST'
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
				text: `There was an error while trying to register profile ${ profileTypeString[ item.value.type ] } for ${ item.value.wiki }.`,
				type: 'danger'
			} )
		} else {
			addToast( {
				text: `Profile ${ profileTypeString[ item.value.type ] } in ${ item.value.wiki } was registered successfully.`,
				type: 'success'
			} )
		}
	}
}
