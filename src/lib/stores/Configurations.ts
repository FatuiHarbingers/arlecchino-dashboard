import type { ConfigurationPOSTRequest } from '@arlecchino/api'
import { writable } from 'svelte/store'

export type Configuration = ConfigurationPOSTRequest & {
	readonly _original?: ConfigurationPOSTRequest
	remove: boolean
}

export const configurations = writable<(Configuration)[]>( [] )

export const set = ( options: ConfigurationPOSTRequest[] ) => {
	configurations.set( options.map( i => {
		return { ...i, remove: false, _original: i }
	} ) )
}

export const setWiki = ( idx: number, wiki: string ) => {
	configurations.update( list => {
		list[ idx ].wiki = wiki
		return list
	} )
}

export const subscribe = configurations.subscribe

export const update = ( options: Pick<Configuration, 'wiki'> & Partial<Omit<Configuration, '_original'>> ) => {
	configurations.update( list => {
		const idx = list.findIndex( i => i.wiki === options.wiki )
		if ( idx !== -1 ) {
			list[ idx ] = Object.assign( list[ idx ], options )
		}
		return list
	} )
}

export const add = ( options: Omit<Configuration, '_original'> ): Configuration => {
	configurations.update( list => {
		const exists = list.find( i => i.wiki === options.wiki )
		if ( !exists ) {
			list.push( options )
		}
		return list
	} )
	return options
}
