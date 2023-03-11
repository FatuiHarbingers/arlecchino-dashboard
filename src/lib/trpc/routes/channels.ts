import { rest } from '$lib/rest'
import { SnowflakeValidator } from '$lib/utils'
import { s } from '@sapphire/shapeshift'
import { ChannelType, Routes, type APIChannel, type APIGuildTextChannel } from 'discord-api-types/v10'
import { session } from '../middlewares'
import { t } from '../t'

export const list = t.procedure
	.use( session )
	.input( s.object( {
		guild: SnowflakeValidator
	} ) )
	.query( async ( { input } ) => {
		const channels = await rest.get( Routes.guildChannels( input.guild ) ) as APIChannel[]
		
		return channels.filter( c => c.type === ChannelType.GuildText ) as APIGuildTextChannel<ChannelType.GuildText>[]
	} )

export const channels = t.router( {
	list
} )
