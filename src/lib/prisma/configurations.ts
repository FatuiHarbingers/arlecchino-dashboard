import { prisma } from '$lib/prisma'

export const updateConfiguration = async ( options: {
	channel: string
	guild: string
	wiki: string
} ) => prisma.configurations.update( {
	data: options,
	where: {
		guild_wiki: {
			guild: options.guild,
			wiki: options.wiki
		}
	}
} )

export const configurationExists = async ( guild: string, wiki: string ): Promise<boolean> => {
	const exists = await prisma.configurations.findFirst( {
		where: { guild, wiki }
	} )
	return Boolean( exists )
}

export const getConfigurationCount = ( guild: string ): Promise<number> => prisma.configurations.count( {
	where: { guild }
} )

export const getConfigurationLimit = async ( snowflake: string ): Promise<number> => {
	const limit = ( await prisma.guilds.findUnique( {
		where: { snowflake }
	} ) )?.limit ?? 1
	return limit
}
