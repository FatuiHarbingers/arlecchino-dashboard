import { TRPCError } from '@trpc/server'
import { session } from './session'
import { REST } from '@discordjs/rest'
import { Routes, type APIGuild } from 'discord-api-types/v10'
import { s } from '@sapphire/shapeshift'
import { SnowflakeValidator } from '$lib/utils'
import { PermissionsBitField } from 'discord.js'

export const manage = session.unstable_pipe( async ( { ctx, input, rawInput, next } ) => {
	input ??= rawInput
	try {
		const { guild } = s.object( {
			guild: SnowflakeValidator
		} ).ignore.parse( input )
		const { session } = ctx
		const rest = new REST( {
			authPrefix: 'Bearer',
			version: '10'
		} ).setToken( session.access_token )
		const guilds = await rest.get( Routes.userGuilds() ) as APIGuild[]
		const userGuild = guilds.find( g => g.id === guild )
		if ( !userGuild?.permissions ) {
			throw new Error()
		}

		const permissions = new PermissionsBitField( BigInt( userGuild.permissions ) )
		if ( !permissions.has( 'ManageGuild' ) ) {
			throw new Error()
		}
	} catch ( e ) {
		throw new TRPCError( {
			code: 'UNAUTHORIZED'
		} )
	}
	return next( { ctx } )
} )
