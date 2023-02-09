import { redirect, type ServerLoadEvent } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ( event: ServerLoadEvent ) => {
	const userId = event.cookies.get( 'user_id' )
	const { user } = await event.parent()
	if ( !userId || !user ) {
		throw redirect( 307, '/' )
	}

	return { userId }
}
