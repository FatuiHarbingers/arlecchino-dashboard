import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { env, getSession } from '$lib'
import { REST } from '@discordjs/rest'
import { Routes, type APIGuild } from 'discord-api-types/v10'
import { PermissionsBitField } from 'discord.js'
import { getRoute, Routes as APIRoutes } from '@arlecchino/api'
import type { GuildsGETResponse } from '@arlecchino/api'

const hasPermissions = ( guild: APIGuild ): boolean => {
	if ( !guild.permissions ) return false

	const permissions = new PermissionsBitField( BigInt( guild.permissions ) )
	return permissions.has( 'ManageGuild' )
}

const getUserGuilds = async ( sessionEncrypt: string | undefined ): Promise<APIGuild[]> => {
	if ( !sessionEncrypt ) throw error( 401 )
	const session = await getSession( sessionEncrypt )
	
	const rest = new REST( {
		authPrefix: 'Bearer',
		version: '10'
	} ).setToken( session.access_token )
	const guilds = await rest.get( Routes.userGuilds() ) as APIGuild[]

	return guilds
}

type ManagedGuild = ( APIGuild & { hasBot: boolean; limit: number } )

const fetchData = async ( guild: APIGuild ): Promise<ManagedGuild> => {
	try {
		const url = new URL( getRoute( APIRoutes.GUILDS, { guildId: guild.id } ), env.API_URL )
		const req = await fetch( url )
		const res = await req.json() as GuildsGETResponse

		if ( 'error' in res ) {
			throw new Error( res.error )
		}

		return {
			...guild,
			hasBot: res.exists,
			limit: res.limit
		}
	} catch {
		return {
			...guild,
			hasBot: false,
			limit: 0
		}
	}
}

export const GET: RequestHandler = async event => {
	try {
		const sessionEncrypt = event.cookies.get( 'session' )
		const guilds = await getUserGuilds( sessionEncrypt )
		
		const promises: Promise<ManagedGuild>[] = []
		for ( const guild of guilds ) {
			if ( !hasPermissions( guild ) ) continue
			promises.push( fetchData( guild ) )
		}

		const managedGuilds = await Promise.all( promises )
	
		return json( { guilds: managedGuilds.sort( ( a, b ) => a.name.localeCompare( b.name ) ) } )
	} catch ( e ) {
		throw error( 400 )
	}
}
