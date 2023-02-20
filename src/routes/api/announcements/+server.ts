import { error, json, type RequestHandler } from '@sveltejs/kit'
import { s } from '@sapphire/shapeshift'
import { env } from '$lib'
import { SnowflakeValidator } from '@arlecchino/api'

export const POST: RequestHandler = async event => {
	try {
		const data = await event.request.json()
		const { channel, guild } = s.object( {
			channel: SnowflakeValidator,
			guild: SnowflakeValidator
		} ).ignore.parse( data )

		const url = new URL( `/follow/${ guild }`, env.API_URL )
		const req = await event.fetch( url, {
			body: JSON.stringify( { channel } ),
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
