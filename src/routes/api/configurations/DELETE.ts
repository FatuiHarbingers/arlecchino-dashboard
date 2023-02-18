import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from '@sveltejs/kit'
import { s } from '@sapphire/shapeshift'
import { env } from '$lib'
import { getRoute, Routes, type ConfigurationsDELETERequest } from '@arlecchino/api'

export const DELETE: RequestHandler = async event => {
	try {
		const data = await event.request.json()
		const parser = s.object<ConfigurationsDELETERequest & { guild: string }>( {
			guild: s.string,
			wiki: s.string
		} ).ignore
		const { guild: guildId, wiki } = parser.parse( data )

		const url = new URL( getRoute( Routes.CONFIGURATIONS, { guildId } ), env.API_URL )
		await event.fetch( url, {
			body: JSON.stringify( { wiki } ),
			headers: {
				'content-type': 'application/json'
			},
			method: 'DELETE'
		} )
		return json( data )
	} catch ( e ) {
		console.log( e )
		throw error( 400 )
	}
}
