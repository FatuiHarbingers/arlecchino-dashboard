import { createContext, router } from '$lib/trpc'
import { createTRPCHandle } from 'trpc-sveltekit'

export const handle = createTRPCHandle( { createContext, router } )
