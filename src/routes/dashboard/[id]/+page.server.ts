import { env } from '$lib'
import type { ServerLoadEvent } from '@sveltejs/kit'
import type { PageServerParentData } from '../$types'
import { ChannelType, type APIChannel } from 'discord.js'

export const load = async ( event: ServerLoadEvent<{ id: string }, PageServerParentData, '/dashboard/:id'> ) => {
	const guildId = event.params.id
	
	const list = await event.fetch( `${ env.API_URL }/list/${ guildId }` )
	const wikis = await list.json() as {
		avatar?: string
		channel: string
		color: number
		guild: string
		name?: string
		wiki: string
	}[]

	const reqChannels = await event.fetch( `${ env.API_URL }/channels/${ guildId }` )
	const channels = ( await reqChannels.json() ).channels as APIChannel[]

	const reqLimit = await event.fetch( `${ env.API_URL }/guild/${ guildId }` )
	const { limit } = ( await reqLimit.json() as { limit: number } )

	return {
		channels: channels.filter( c => c.type === ChannelType.GuildText ),
		guildId,
		limit,
		wikis
	}
}
