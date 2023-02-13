import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { env, getSession } from '$lib'
import { REST } from '@discordjs/rest'
import { Routes, type APIGuild } from 'discord-api-types/v10'
import { PermissionsBitField } from 'discord.js'
import { Routes as APIRoutes } from '@arlecchino/api'
import type { GuildGETResponse } from '@arlecchino/api'

const hasPermissions = ( guild: APIGuild ): boolean => {
	if ( !guild.permissions ) return false

	const permissions = new PermissionsBitField( BigInt( guild.permissions ) )
	return permissions.has( 'ManageGuild' )
}

const getUserGuilds = async ( sessionEncrypt: string | undefined ): Promise<APIGuild[]> => {
	if ( !sessionEncrypt ) throw error( 401 )
	const session = await getSession( sessionEncrypt )
	
	const rest = new REST( {
		authPrefix: 'Bearer',
		version: '10'
	} ).setToken( session.access_token )
	const guilds = await rest.get( Routes.userGuilds() ) as APIGuild[]

	return guilds
}

export const GET: RequestHandler = async event => {
	try {
		const sessionEncrypt = event.cookies.get( 'session' )
		const guilds = await getUserGuilds( sessionEncrypt )
		
		const managedGuilds: ( APIGuild & { hasBot: boolean; limit: number } )[] = []
		for ( const guild of guilds ) {
			if ( !hasPermissions( guild ) ) continue
	
			try {
				const url = new URL( APIRoutes.GUILD.replace( ':guildId', guild.id ), env.API_URL )
				const req = await event.fetch( url )
				const res = await req.json() as GuildGETResponse

				if ( 'error' in res ) {
					throw new Error( res.error )
				}

				managedGuilds.push( {
					...guild,
					hasBot: res.exists,
					limit: res.limit
				} )
			} catch {
				managedGuilds.push( {
					...guild,
					hasBot: false,
					limit: 0
				} )
			}
		}
	
		return json( { guilds: managedGuilds.sort( ( a, b ) => a.name.localeCompare( b.name ) ) } )
	} catch ( e ) {
		throw error( 400 )
	}
}
