import { load } from 'ts-dotenv'

const schema = {
	API_URL: String,
	DISCORD_API: String,
	DISCORD_CLIENT_ID: String,
	DISCORD_CLIENT_SECRET: String,
	DISCORD_GUILD: String,
	DISCORD_LOGS: String,
	DISCORD_REDIRECT_URI: String,
	DISCORD_TOKEN: String,
	NODE_ENV: [
		'development' as const,
		'production' as const
	],
	REDIS_DB: Number,
	REDIS_HOST: String,
	REDIS_PASSWORD: {
		default: '',
		type: String
	},
	REDIS_PORT: Number,
	REDIS_USERNAME: {
		default: '',
		type: String
	}
}

export const env = load( schema )
