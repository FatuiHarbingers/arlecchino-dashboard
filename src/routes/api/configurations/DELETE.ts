import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from '@sveltejs/kit'
import { s } from '@sapphire/shapeshift'
import { env } from '$lib'
import { Routes, type ConfigurationsDELETERequest } from '@arlecchino/api'

export const DELETE: RequestHandler = async event => {
	try {
		const data = await event.request.json()
		const parser = s.object( {
			guild: s.string,
			wiki: s.string
		} ).ignore
		const { guild, wiki } = parser.parse( data )

		const url = new URL( Routes.CONFIGURATIONS.replace( ':guildId', guild ), env.API_URL )
		const req = await event.fetch( url, {
			body: JSON.stringify( { wiki } as ConfigurationsDELETERequest ),
			headers: {
				'content-type': 'application/json'
			},
			method: 'DELETE'
		} )
		const res = await req.json()
		return json( res )
	} catch ( e ) {
		throw error( 400 )
	}
}