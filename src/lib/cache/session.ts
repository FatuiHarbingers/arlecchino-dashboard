import { env } from '../environment'
import { redis } from '../redis'
import { Time } from '@sapphire/timestamp'
import { InvalidSession } from '../errors'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

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

export const getSession = async ( encrypted: string | undefined ): Promise<SessionData> => {
	if ( !encrypted ) throw new InvalidSession()

	const [ data, iv ] = encrypted.split( '.' )

	try {
		const decipher = createDecipheriv( 'aes-256-cbc', env.DISCORD_CLIENT_SECRET, Buffer.from( iv, 'base64' ) )
		return JSON.parse( decipher.update( data, 'base64', 'utf-8' ) + decipher.final( 'utf-8' ) )
	} catch {
		throw new InvalidSession()
	}
}

export const setSession = async ( options: { code: string, state: string } ): Promise<string> => {
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

	const iv = randomBytes( 16 )
	const cipheriv = createCipheriv( 'aes-256-cbc', env.DISCORD_CLIENT_SECRET, iv )

	const data = cipheriv.update( JSON.stringify( res ), 'utf-8', 'base64' )
	const final = cipheriv.final( 'base64' )
	const ivString = iv.toString( 'base64' )

	return `${ data }${ final }.${ ivString }`
}