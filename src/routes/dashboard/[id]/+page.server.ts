import { prisma } from '$lib'
import type { ServerLoadEvent } from '@sveltejs/kit'
import type { PageParentData } from '../$types'
import type { PageServerLoad } from './$types'
import { createContext, router } from '$lib/trpc'

export const load: PageServerLoad = async ( event: ServerLoadEvent<{ id: string }, PageParentData, '/dashboard/[id]'> ) => {
	const guild = event.params.id

	const t = router.createCaller( await createContext( event ) )
	const configurations = await t.configurations.list( { guild } )

	const wikis = configurations.map( i => ( { channel: i.channel, wiki: i.wiki } ) )
	const channels = await t.channels.list( { guild } )

	const limit = ( await prisma.guilds.findUnique( {
		where: {
			snowflake: guild
		}
	} ) )?.limit ?? 1

	return {
		channels,
		guildId: guild,
		limit,
		wikis
	}
}
