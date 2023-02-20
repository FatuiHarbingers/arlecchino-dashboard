import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { env } from '$lib'
import { getRoute, Routes as APIRoutes } from '@arlecchino/api'

export const GET: RequestHandler = async event => {
	const guildId = event.url.searchParams.get( 'guild' )
	if ( !guildId ) throw error( 400 )
	
	try {
		const url = new URL( getRoute( APIRoutes.PROFILES, { guildId } ), env.API_URL )
		const req = await event.fetch( url )
		const res = await req.json()

		return json( res )
	} catch ( e ) {
		console.error( e )
		throw error( 400 )
	}
}
