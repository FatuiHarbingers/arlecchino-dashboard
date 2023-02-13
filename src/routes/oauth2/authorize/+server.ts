import { setSession } from '$lib'
import { error, redirect } from '@sveltejs/kit'
import type { RequestEvent } from './$types'
import { Time } from '@sapphire/timestamp'

export async function GET( req: RequestEvent ) {
	const code = req.url.searchParams.get( 'code' )
	const state = req.url.searchParams.get( 'state' )

	if ( !code || !state ) throw error( 401 )
	if ( req.cookies.get( 'user_id' ) !== state ) {
		throw error( 400, {
			message: 'Couldn\'t authenticate the identity of the requester.'
		} )
	}

	const session = await setSession( { code, state } )
	req.cookies.set( 'session', session, {
		expires: new Date( Date.now() + Time.Day * 6 ),
		path: '/'
	} )

	throw redirect( 302, '/' )
}