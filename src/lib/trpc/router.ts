import { announcements } from './routes/announcements'
import { channels } from './routes/channels'
import { configurations } from './routes/configurations'
import { guilds } from './routes/guilds'
import { profiles } from './routes/profiles'
import { t } from './t'

export const router = t.router( {
	announcements,
	channels,
	configurations,
	guilds,
	profiles
} )

export type Router = typeof router
