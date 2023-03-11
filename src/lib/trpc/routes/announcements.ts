import { env } from '$lib/environment'
import { SnowflakeValidator } from '$lib/utils'
import { s } from '@sapphire/shapeshift'
import { manage } from '../middlewares'
import { t } from '../t'
import { Routes, type APIChannel, type APIGuild } from 'discord-api-types/v10'
import { rest } from '$lib/rest'
import { TRPCError } from '@trpc/server'

let channelsCache: Record<string, string> | null = null

const getChannels = async (): Promise<Record<string, string>> => {
	if ( channelsCache ) return channelsCache
	channelsCache = {}

	const guildChannels = await rest.get( Routes.guildChannels( env.DISCORD_GUILD ) ) as APIChannel[]
	const arlecchino = guildChannels.filter( i => i.name?.startsWith( 'arlecchino-' ) )
	for ( const channel of arlecchino ) {
		const [ , locale ] = channel.name?.split( '-' ) ?? []
		if ( !locale ) continue
		channelsCache[ locale ] = channel.id
	}

	return channelsCache
}

export const announcements = t.procedure
	.use( manage )
	.input( s.object( {
		channel: SnowflakeValidator,
		guild: SnowflakeValidator
	} ) )
	.query( async ( { input } ) => {
		const devChannels = await getChannels()
		const targetGuild = await rest.get( Routes.guild( input.guild ) ) as APIGuild
		const locale = targetGuild.preferred_locale.split( '-' ).shift() ?? 'en'
		const announcements = devChannels[ locale ] ?? devChannels.en
		if ( !announcements ) {
			throw new TRPCError( {
				code: 'NOT_FOUND'
			} )
		}

		await rest.post( Routes.channelFollowers( announcements ), {
			body: {
				webhook_channel_id: input.channel
			}
		} )

		await rest.post( Routes.channelMessages( env.DISCORD_LOGS ), {
			body: {
				content: `**${ targetGuild.name }** (${ targetGuild.id }) is following <#${ announcements }>.`
			}
		} )
	} )
