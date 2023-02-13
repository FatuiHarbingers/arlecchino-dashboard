import { getSession } from '$lib'
import type { ServerLoadEvent } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import { REST } from '@discordjs/rest'
import { Routes, type APIUser } from 'discord-api-types/v10'

export const load: LayoutServerLoad = async ( event: ServerLoadEvent ) => {
	const sessionEncrypt = event.cookies.get( 'session' )
	if ( !sessionEncrypt ) return { version: APP_VERSION }

	try {
		const session = await getSession( sessionEncrypt )
		const rest = new REST( {
			authPrefix: 'Bearer',
			version: '10'
		} ).setToken( session.access_token )
		const { avatar, discriminator, id, locale, username } = await rest.get( Routes.user() ) as APIUser

		return {
			user: { avatar, discriminator, id, locale, username },
			version: APP_VERSION
		}
	} catch ( e ) {
		console.error( e )
		return { version: APP_VERSION }
	}
}
