import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { env, getSession } from '$lib'
import { REST } from '@discordjs/rest'
import { Routes, type APIGuild } from 'discord-api-types/v10'
import { PermissionsBitField } from 'discord.js'

export const GET: RequestHandler = async event => {
	try {
		const userId = event.cookies.get( 'user_id' )
		if ( !userId ) throw error( 401 )
		const session = await getSession( userId )
	
		const rest = new REST( {
			authPrefix: 'Bearer',
			version: '10'
		} ).setToken( session.access_token )
		const guilds = await rest.get( Routes.userGuilds() ) as APIGuild[]
		
		const managedGuilds: ( APIGuild & { hasBot: boolean; limit: number } )[] = []
		for ( const guild of guilds ) {
			if ( !guild.permissions ) continue
	
			const permissions = new PermissionsBitField( BigInt( guild.permissions ) )
			if ( !permissions.has( 'ManageGuild' ) ) continue
	
			try {
				const req = await event.fetch( `${ env.API_URL }/guild/${ guild.id }` )
				const res = await req.json() as { exists: boolean, limit: number }
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
	
		return json( { guilds: managedGuilds } )
	} catch ( e ) {
		throw error( 400 )
	}
}
