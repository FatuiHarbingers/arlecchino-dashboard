import type { trpc } from '$lib/trpc/client'
import { Profile_type } from '@prisma/client'
import { writable } from 'svelte/store'

export type ProfileBase = Omit<Awaited<ReturnType<ReturnType<typeof trpc>[ 'profiles' ][ 'list' ][ 'query' ]>>[ number ], 'Configurations' | 'guild'>

export type Profile = ProfileBase & {
	_original?: ProfileBase
	remove?: boolean
}

export interface ProfileStore {
	[ wiki: string ]: Profile[]
}

export const profiles = writable<ProfileStore>( {} )

export function getProfile( store: ProfileStore, interwiki: string, type?: undefined ): Profile[]
export function getProfile( store: ProfileStore, interwiki: string, type: Profile_type ): Profile
export function getProfile( store: ProfileStore, interwiki: string, type?: Profile_type | undefined ): Profile | Profile[] {
	const wiki = store[ interwiki ] ?? []
	store[ interwiki ] ??= wiki

	if ( type === undefined ) return wiki

	const profile = wiki.find( p => p.type === type )
	if ( profile ) return profile

	const newProfile: Profile = {
		avatar: null,
		color: null,
		name: null,
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

export const updateProperty = ( options: { interwiki: string, type: Profile_type }, property: 'avatar' | 'color' | 'name' | 'remove', value: string | number | boolean ) => {
	profiles.update( store => {
		const profile = getProfile( store, options.interwiki, options.type )
		
		if ( ( property !== 'color' && typeof value === 'string' )
			|| ( property === 'color' && typeof value === 'number' )
			|| ( property === 'remove' && typeof value === 'boolean' ) ) {
			// @ts-expect-error - asserted enough
			profile[ property ] = value
		} else {
			throw new Error( `Invalid value "${ value }" for property "${ property }".` )
		}

		return store
	} )
}

export const profileTypes = [ Profile_type.Default, Profile_type.Discussions, Profile_type.LogEvents, Profile_type.RecentChanges ]
