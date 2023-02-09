import { setSession } from '$lib'
import { error, redirect } from '@sveltejs/kit'
import type { RequestEvent } from './$types'

export async function GET( req: RequestEvent ) {
	const code = req.url.searchParams.get( 'code' )
	const state = req.url.searchParams.get( 'state' )

	if ( !code || !state ) throw error( 401 )
	if ( req.cookies.get( 'user_id' ) !== state ) {
		throw error( 400, {
			message: 'Couldn\'t authenticate the identity of the requester.'
		} )
	}

	await setSession( { code, state } )
	throw redirect( 302, '/' )
}