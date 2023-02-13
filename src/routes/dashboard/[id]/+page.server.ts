import { env } from '$lib'
import { error, type ServerLoadEvent } from '@sveltejs/kit'
import type { PageParentData } from '../$types'
import { ChannelType, type APIChannel } from 'discord.js'
import { Routes, type ChannelsGETResponse, type ConfigurationsGETResponse, type GuildGETResponse } from '@arlecchino/api'

export const load = async ( event: ServerLoadEvent<{ id: string }, PageParentData, '/dashboard/:id'> ) => {
	const guildId = event.params.id
	
	const list = await event.fetch( new URL( Routes.CONFIGURATIONS.replace( ':guildId', guildId ), env.API_URL ) )
	const wikis = await list.json() as ConfigurationsGETResponse

	const reqChannels = await event.fetch( new URL( Routes.CHANNELS.replace( ':guildId', guildId ), env.API_URL ) )
	const resChannels = await reqChannels.json() as ChannelsGETResponse

	const reqLimit = await event.fetch( new URL( Routes.GUILD.replace( ':guildId', guildId ), env.API_URL ) )
	const resLimit = await reqLimit.json() as GuildGETResponse

	if ( 'error' in wikis || 'error' in resChannels || 'error' in resLimit ) throw error( 400 )

	return {
		channels: resChannels.channels.filter( c => c.type === ChannelType.GuildText ),
		guildId,
		limit: resLimit.limit,
		wikis
	}
}
