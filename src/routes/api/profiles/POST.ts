import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { env } from '$lib'
import { getRoute, Routes as APIRoutes, ProfilesPOSTValidator, SnowflakeValidator } from '@arlecchino/api'

export const POST: RequestHandler = async event => {
	const validator = ProfilesPOSTValidator.extend( {
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
			method: 'POST'
		} )
		const res = await req.json()
		
		return json( res )
	} catch ( e ) {
		throw error( 400 )
	}
}
