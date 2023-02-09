import { env } from '../environment'
import { redis } from '../redis'
import { Time } from '@sapphire/timestamp'
import { InvalidSession } from '../errors'

interface SessionData {
	access_token: string
	created_at: number
	expires_in: number
	refresh_token: string
	scope: string
	token_type: string
}

export const enum KeyPrefix {
	SESSIONS = 'dc:sessions'
}

export const getSessionKey = ( userId: string ) => `${ KeyPrefix.SESSIONS }/${ userId }`

export const getSession = async ( userId: string ): Promise<SessionData> => {
	const key = getSessionKey( userId )
	const exists = await redis.exists( key )
	if ( !exists ) throw new InvalidSession( userId )

	const { created_at, expires_in, ...session } = await redis.hgetall( key ) as Record<keyof SessionData, string>
	return {
		...session,
		created_at: parseInt( created_at, 10 ),
		expires_in: parseInt( expires_in, 10 )
	}
}

export const setSession = async ( options: { code: string, state: string } ): Promise<void> => {
	const { code, state } = options
	
	const params = new URLSearchParams( {
		client_id: env.DISCORD_CLIENT_ID,
		client_secret: env.DISCORD_CLIENT_SECRET,
		code,
		grant_type: 'authorization_code',
		redirect_uri: env.DISCORD_REDIRECT_URI
	} )
	const req = await fetch( `${ env.DISCORD_API }/oauth2/token`, {
		body: params,
		headers: {
			'content-type': 'application/x-www-form-urlencoded'
		},
		method: 'POST'
	} )
	const res = await req.json() as SessionData
	res.created_at = Date.now()

	const key = getSessionKey( state )
	await redis.hset( key, res )
	await redis.expire( key, Time.Day * 6 )
}