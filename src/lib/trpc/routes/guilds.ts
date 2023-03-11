import { prisma } from '$lib/prisma'
import { redis } from '$lib/redis'
import { rest as restBot } from '$lib/rest'
import { SnowflakeValidator } from '$lib/utils'
import { REST } from '@discordjs/rest'
import { s } from '@sapphire/shapeshift'
import { Routes, type APIGuild } from 'discord-api-types/v10'
import { PermissionsBitField } from 'discord.js'
import { manage, session } from '../middlewares'
import { t } from '../t'

const botHasGuild = async ( guild: string ): Promise<boolean> => {
	const key = `guilds:${ guild }`
	const exists = await redis.exists( key )
	if ( exists ) {
		const value = await redis.get( key )
		return value === '1'
	}

	let hasBot = true
	try {
		await restBot.get( Routes.guild( guild ) )
	} catch {
		hasBot = false
	}
	await redis.set( key, Number( hasBot ) )
	await redis.expire( key, 60 * 5 )

	return hasBot
}

const hasPermissions = ( guild: APIGuild ): boolean => {
	if ( !guild.permissions ) return false
	
	const permissions = new PermissionsBitField( BigInt( guild.permissions ) )
	return permissions.has( 'ManageGuild' )
}

const loadGuildBot = async ( guild: APIGuild ): Promise<APIGuild & {
	hasBot: boolean
	limit: number
}> => {
	const hasBot = await botHasGuild( guild.id )
	const limit = ( await prisma.guilds.findUnique( {
		where: {
			snowflake: guild.id
		}
	} ) )?.limit ?? 1
	return {
		...guild,
		hasBot,
		limit
	}
}

export const list = t.procedure
	.use( session )
	.query( async ( { ctx } ) => {
		const { session } = ctx
		const restUser = new REST( {
			authPrefix: 'Bearer',
			version: '10'
		} ).setToken( session.access_token )
		const guilds = await restUser.get( Routes.userGuilds() ) as APIGuild[]
		
		const promises = await Promise.all( guilds.map( loadGuildBot ) )
		return promises.filter( hasPermissions ).sort( ( a, b ) => a.name.localeCompare( b.name ) )
	} )

export const get = t.procedure
	.use( manage )
	.input( s.object( {
		guild: SnowflakeValidator
	} ) )
	.query( async ( { ctx, input } ) => {
		const { session } = ctx
		const rest = new REST( {
			authPrefix: 'Bearer',
			version: '10'
		} ).setToken( session.access_token )
		const apiGuild = await rest.get( Routes.guild( input.guild ) ) as APIGuild
		const guild = await loadGuildBot( apiGuild )
		return guild
	} )

export const guilds = t.router( {
	list
} )