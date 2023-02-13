import { getSession } from '$lib'
import { REST } from '@discordjs/rest'
import { s } from '@sapphire/shapeshift'
import { error, type Handle } from '@sveltejs/kit'
import { Routes, type APIGuild } from 'discord-api-types/v10'
import { PermissionsBitField } from 'discord.js'
import { SnowflakeRegex } from '@sapphire/discord-utilities'

export const handle: Handle = async input => {
	const { event, resolve } = input

	if ( event.request.method === 'POST' && event.url.pathname.startsWith( '/api' ) ) {
		const sessionEncrypt = event.cookies.get( 'session' )
		if ( !sessionEncrypt ) throw error( 401 )

		try {
			const body = await event.request.clone().json()
			const validator = s.object( {
				guild: s.string.regex( SnowflakeRegex )
			} ).ignore
			const data = validator.parse( body )

			const session = await getSession( sessionEncrypt )
			const rest = new REST( {
				authPrefix: 'Bearer',
				version: '10'
			} ).setToken( session.access_token )
			const guilds = await rest.get( Routes.userGuilds() ) as APIGuild[]
			const guild = guilds.find( g => g.id === data.guild )
			if ( !guild?.permissions ) throw error( 403 )
			
			const permissions = new PermissionsBitField( BigInt( guild.permissions ) )
			if ( !permissions.has( 'ManageGuild' ) ) throw error( 403 )
		} catch {
			throw error( 400 )
		}
	}

	const response = await resolve( event )
	return response
}