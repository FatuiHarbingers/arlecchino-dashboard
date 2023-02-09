import { getSession } from '$lib'
import type { ServerLoadEvent } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import { REST } from '@discordjs/rest'
import { Routes, type APIUser } from 'discord-api-types/v10'

export const load: LayoutServerLoad = async ( event: ServerLoadEvent ) => {
	const userId = event.cookies.get( 'user_id' )
	if ( !userId ) return

	try {
		const session = await getSession( userId )
		const rest = new REST( {
			authPrefix: 'Bearer',
			version: '10'
		} ).setToken( session.access_token )
		const { avatar, discriminator, id, locale, username } = await rest.get( Routes.user() ) as APIUser

		return {
			user: { avatar, discriminator, id, locale, username }
		}
	} catch ( e ) {
		console.error( e )
		return
	}
}
