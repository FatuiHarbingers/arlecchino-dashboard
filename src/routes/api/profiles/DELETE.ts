import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { env } from '$lib'
import { getRoute, Routes as APIRoutes, ProfilesDELETEValidator, SnowflakeValidator } from '@arlecchino/api'

export const DELETE: RequestHandler = async event => {
	const validator = ProfilesDELETEValidator.extend( {
		guild: SnowflakeValidator
	} )
	
	try {
		const { guild: guildId, ...body } = validator.parse( await event.request.json() )
		const url = new URL( getRoute( APIRoutes.PROFILES, { guildId } ), env.API_URL )
		const req = await event.fetch( url, {
			body: JSON.stringify( body ),
			headers: {
				'content-type': 'application/json'
			},
			method: 'DELETE'
		} )

		if ( req.status >= 400 ) throw error( 400 )

		return json( null )
	} catch ( e ) {
		console.error( e )
		throw error( 400 )
	}
}
