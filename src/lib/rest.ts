import { env } from './environment'
import { REST } from '@discordjs/rest'

export const rest = new REST( {
	version: '10'
} ).setToken( env.DISCORD_TOKEN )
