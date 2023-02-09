import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { s } from '@sapphire/shapeshift'
import { env, getSession } from '$lib'
import { REST } from '@discordjs/rest'
import { Routes, type APIGuild } from 'discord-api-types/v10'
import { PermissionsBitField } from 'discord.js'

export const POST: RequestHandler = async event => {
	try {
		const userId = event.cookies.get( 'user_id' )
		if ( !userId ) throw error( 401 )

		const data = await event.request.json()
		const parser = s.object( {
			avatar: s.string.optional,
			channel: s.string,
			color: s.number.optional,
			guild: s.string,
			name: s.string.optional,
			update: s.boolean.default( false ),
			wiki: s.string
		} ).ignore
		const body = parser.parse( data )

		const session = await getSession( userId )
		const rest = new REST( {
			authPrefix: 'Bearer',
			version: '10'
		} ).setToken( session.access_token )
		const guilds = await rest.get( Routes.userGuilds() ) as APIGuild[]
		const guild = guilds.find( g => g.id === body.guild )
		if ( !guild?.permissions ) throw error( 403 )
		
		const permissions = new PermissionsBitField( BigInt( guild.permissions ) )
		if ( !permissions.has( 'ManageGuild' ) ) throw error( 403 )

		const req = await event.fetch( `${ env.API_URL }/register`, {
			body: JSON.stringify( body ),
			headers: {
				'content-type': 'application/json'
			},
			method: 'POST'
		} )
		const res = await req.json()
		return json( res )
	} catch ( e ) {
		throw error( 400 )
	}
}
