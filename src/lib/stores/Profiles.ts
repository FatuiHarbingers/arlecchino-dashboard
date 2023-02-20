import { ProfileType, type ProfilesPOSTRequest } from '@arlecchino/api'
import { writable } from 'svelte/store'

export type Profile = ProfilesPOSTRequest & {
	_original?: ProfilesPOSTRequest
	remove?: boolean
}

export interface ProfileStore {
	[ wiki: string ]: Profile[]
}

export const profiles = writable<ProfileStore>( {} )

export function getProfile( store: ProfileStore, interwiki: string, type?: undefined ): Profile[]
export function getProfile( store: ProfileStore, interwiki: string, type: ProfileType ): Profile
export function getProfile( store: ProfileStore, interwiki: string, type?: ProfileType | undefined ): Profile | Profile[] {
	const wiki = store[ interwiki ] ?? []
	store[ interwiki ] ??= wiki

	if ( type === undefined ) return wiki

	const profile = wiki.find( p => p.type === type )
	if ( profile ) return profile

	const newProfile = {
		type,
		wiki: interwiki
	}
	profiles.update( list => {
		list[ interwiki ] ??= []
		list[ interwiki ].push( newProfile )
		return list
	} )
	
	return newProfile
}

export const updateProperty = ( options: { interwiki: string, type: ProfileType }, property: 'avatar' | 'color' | 'name' | 'remove', value: string | number | boolean ) => {
	profiles.update( store => {
		const profile = getProfile( store, options.interwiki, options.type )
		
		if ( ( property !== 'color' && typeof value === 'string' )
			|| ( property === 'color' && typeof value === 'number' )
			|| ( property === 'remove' && typeof value === 'boolean' ) ) {
			// @ts-expect-error
			profile[ property ] = value
		} else {
			throw new Error( `Invalid value "${ value }" for property "${ property }".` )
		}

		return store
	} )
}

export const profileTypeString: Record<ProfileType, string> = {
	[ ProfileType.DEFAULT ]: 'Default',
	[ ProfileType.DISCUSSIONS ]: 'Discussions',
	[ ProfileType.LOGEVENTS ]: 'Log events',
	[ ProfileType.RECENTCHANGES ]: 'Recent changes'
}

export const profileTypes = [ ProfileType.DEFAULT, ProfileType.DISCUSSIONS, ProfileType.LOGEVENTS, ProfileType.RECENTCHANGES ]
