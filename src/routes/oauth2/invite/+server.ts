import { redirect } from '@sveltejs/kit'
import type { RequestEvent } from './$types'
import { randomBytes } from 'crypto'
import { env } from '$lib'
import { Time } from '@sapphire/timestamp'

export function GET( req: RequestEvent ) {
	const userId = randomBytes( 16 ).toString( 'hex' )

	req.cookies.set( 'user_id', userId, {
		expires: new Date( Date.now() + Time.Day * 6 ),
		path: '/'
	} )
	const url = `https://discord.com/api/oauth2/authorize?client_id=${ env.DISCORD_CLIENT_ID }&redirect_uri=${ encodeURIComponent( env.DISCORD_REDIRECT_URI ) }&response_type=code&scope=identify%20guilds%20guilds.members.read&state=${ userId }`
	throw redirect( 302, url )
}
