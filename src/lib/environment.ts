import { load } from 'ts-dotenv'

export const env = load( {
	API_URL: String,
	DISCORD_API: String,
	DISCORD_CLIENT_ID: String,
	DISCORD_CLIENT_SECRET: String,
	DISCORD_REDIRECT_URI: String,
	NODE_ENV: [
		'development' as const,
		'production' as const
	],
	REDIS_DB: Number,
	REDIS_HOST: String,
	REDIS_PASSWORD: String,
	REDIS_PORT: Number,
	REDIS_USERNAME: String
} )
