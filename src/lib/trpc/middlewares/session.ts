import { getSession } from '$lib/cache'
import { TRPCError } from '@trpc/server'
import { t } from '../t'

export const session = t.middleware( async ( { ctx, next } ) => {
	if ( !ctx.session ) {
		throw new TRPCError( {
			code: 'UNAUTHORIZED'
		} )
	}

	return next( {
		ctx: {
			session: await getSession( ctx.session )
		}
	} )
} )
