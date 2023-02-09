import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { s } from '@sapphire/shapeshift'
import { env } from '$lib'

export const POST: RequestHandler = async event => {
	try {
		const data = await event.request.json()
		console.log( data )
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
