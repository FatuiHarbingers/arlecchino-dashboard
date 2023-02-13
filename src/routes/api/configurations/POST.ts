import { error, json, type RequestHandler } from '@sveltejs/kit'
import { s } from '@sapphire/shapeshift'
import { env } from '$lib'
import { Routes } from '@arlecchino/api'

export const POST: RequestHandler = async event => {
	try {
		const data = await event.request.json()
		const parser = s.object( {
			avatar: s.string.url().optional,
			channel: s.string,
			color: s.number.optional,
			guild: s.string,
			name: s.string.optional,
			update: s.boolean.default( false ),
			wiki: s.string
		} ).ignore
		const { guild, ...body } = parser.parse( data )

		const url = new URL( Routes.CONFIGURATIONS.replace( ':guildId', guild ), env.API_URL )
		const req = await event.fetch( url, {
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
