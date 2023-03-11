import { prisma } from '$lib/prisma'
import { configurationExists } from '$lib/prisma/configurations'
import { SnowflakeValidator } from '$lib/utils'
import { Profile_type } from '@prisma/client'
import { EmbedLimits } from '@sapphire/discord-utilities'
import { s } from '@sapphire/shapeshift'
import { manage } from '../middlewares'
import { t } from '../t'

const procedure = t.procedure.use( manage )

const create = procedure
	.input( s.object( {
		avatar: s.string.url().optional,
		color: s.number.greaterThanOrEqual( 0 ).lessThanOrEqual( 0xffffff ).optional,
		guild: SnowflakeValidator,
		name: s.string.lengthGreaterThan( 0 ).lengthLessThanOrEqual( EmbedLimits.MaximumAuthorNameLength ).optional,
		type: s.enum( ...Object.values( Profile_type ) ),
		wiki: s.string.url()
	} ).strict )
	.query( async ( { input } ) => {
		const create = {
			avatar: input.avatar ?? null,
			color: input.color ?? null,
			configurationGuild: input.guild,
			configurationWiki: input.wiki,
			name: input.name ?? null,
			type: input.type
		}
		const update = {
			avatar: create.avatar,
			color: create.color,
			name: create.name
		}
		const where = {
			configurationGuild_configurationWiki_type: {
				configurationGuild: input.guild,
				configurationWiki: input.wiki,
				type: create.type
			}
		}
		await prisma.profile.upsert( { create, update, where } )
	} )

export const list = procedure
	.input( s.object( {
		guild: SnowflakeValidator,
		type: s.enum( ...Object.values( Profile_type ) ).optional,
		wiki: s.string.url().optional
	} ) )
	.query( async ( { input } ) => {
		const where = input.wiki
			? { configurationGuild: input.guild, configurationWiki: input.wiki }
			: { configurationGuild: input.guild }
		const result = await prisma.profile.findMany( {
			include: { Configurations: true },
			where
		} )
		return result.map( ( { configurationGuild, configurationWiki, ...fields } ) => ( {
			...fields,
			guild: configurationGuild,
			wiki: configurationWiki
		} ) )
	} )

export const remove = procedure
	.input( s.object( {
		guild: SnowflakeValidator,
		type: s.enum( ...Object.values( Profile_type ) ),
		wiki: s.string.url()
	} ) )
	.query( async ( { input } ) => {
		const exists = await configurationExists( input.guild, input.wiki )
		if ( !exists ) return true

		await prisma.profile.deleteMany( {
			where: {
				configurationGuild: input.guild,
				configurationWiki: input.wiki,
				type: input.type
			}
		} )
	} )

export const profiles = t.router( {
	create,
	list,
	remove
} )
