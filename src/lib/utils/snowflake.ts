import { SnowflakeRegex } from '@sapphire/discord-utilities'
import { s } from '@sapphire/shapeshift'

export const SnowflakeValidator = s.string.regex( SnowflakeRegex )
