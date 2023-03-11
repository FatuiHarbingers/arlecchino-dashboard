import { writable } from 'svelte/store'

export type Configuration = {
	readonly _original?: {
		channel: string
		update?: boolean;
	}
    channel: string
	remove?: boolean
    update?: boolean
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