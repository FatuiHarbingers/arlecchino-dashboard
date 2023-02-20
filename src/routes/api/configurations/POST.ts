import { error, json, type RequestHandler } from '@sveltejs/kit'
import { s } from '@sapphire/shapeshift'
import { env } from '$lib'
import { getRoute, Routes, type ConfigurationPOSTRequest } from '@arlecchino/api'

export const POST: RequestHandler = async event => {
	try {
		const data = await event.request.json()
		const parser = s.object<ConfigurationPOSTRequest & { guild: string }>( {
			channel: s.string,
			guild: s.string,
			update: s.boolean.default( false ),
			wiki: s.string
		} ).ignore
		const { guild: guildId, ...body } = parser.parse( data )

		const url = new URL( getRoute( Routes.CONFIGURATIONS, { guildId } ), env.API_URL )
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
