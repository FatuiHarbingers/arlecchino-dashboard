import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { s } from '@sapphire/shapeshift'
import { env } from '$lib'

export const POST: RequestHandler = async event => {
	try {
		const data = await event.request.json()
		const parser = s.object( {
			guild: s.string,
			wiki: s.string
		} ).ignore
		const body = parser.parse( data )
		const req = await event.fetch( `${ env.API_URL }/delete`, {
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
