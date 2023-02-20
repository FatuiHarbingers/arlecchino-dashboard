import type { ConfigurationPOSTRequest } from '@arlecchino/api'
import { writable } from 'svelte/store'

export type Configuration = Omit<ConfigurationPOSTRequest, 'wiki'> & {
	readonly _original?: Omit<ConfigurationPOSTRequest, 'wiki'>
	remove?: boolean
}

export interface ConfigurationStore {
	[ wiki: string ]: Configuration
}

export const configurations = writable<ConfigurationStore>( {} )

export const getConfiguration = ( store: ConfigurationStore, wiki: string ): Configuration => {
	const config = store[ wiki ]
	if ( config ) return config

	const newConfig = { channel: '' }
	configurations.update( list => {
		list[ wiki ] = newConfig
		return list
	} )
	return config
}