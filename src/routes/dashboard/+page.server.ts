import { env } from '$lib'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = () => {
	return {
		clientId: env.DISCORD_CLIENT_ID
	}
}
