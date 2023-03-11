import { prisma } from '$lib/prisma'
import { configurationExists, getConfigurationCount, getConfigurationLimit, updateConfiguration } from '$lib/prisma/configurations'
import { SnowflakeValidator } from '$lib/utils'
import { s } from '@sapphire/shapeshift'
import { manage } from '../middlewares'
import { t } from '../t'

const procedure = t.procedure.use( manage )

const create = procedure
	.input( s.object( {
		channel: SnowflakeValidator,
		guild: SnowflakeValidator,
		update: s.boolean.default( false ),
		wiki: s.string.url()
	} ).strict )
	.query( async ( { input } ) => {
		const { update, ...body } = input
		if ( update ) {
			await updateConfiguration( body )
			return
		}

		const limit = await getConfigurationLimit( input.guild )
		const currentCount = await getConfigurationCount( input.guild )
		if ( currentCount >= limit ) {
			throw new Error( 'Guild is already on the maximum number of wikis it can follow.' )
		}

		const alreadyExists = await configurationExists( input.guild, input.wiki )
		if ( alreadyExists ) {
			throw new Error( 'Wiki is already being followed.' )
		}

		await prisma.configurations.create( { data: body } )
	} )

export const list = procedure
	.input( s.object( {
		guild: SnowflakeValidator
	} ) )
	.query( async ( { input } ) => {
		const result = await prisma.configurations.findMany( {
			include: { Profile: true },
			where: { guild: input.guild }
		} )
		return result
	} )

export const remove = procedure
	.input( s.object( {
		guild: SnowflakeValidator,
		wiki: s.string.url()
	} ) )
	.query( async ( { input } ) => {
		const exists = await configurationExists( input.guild, input.wiki )
		if ( !exists ) return true

		await prisma.configurations.delete( {
			include: { Profile: true },
			where: {
				guild_wiki: {
					guild: input.guild,
					wiki: input.wiki
				}
			}
		} )

		return true
	} )

export const configurations = t.router( {
	create,
	list,
	remove
} )
