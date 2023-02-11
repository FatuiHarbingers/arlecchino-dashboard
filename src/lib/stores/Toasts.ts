import type { ToastOptions } from '$lib/types'
import { writable } from 'svelte/store'

export const toasts = writable<ToastOptions[]>( [] )

export const subscribe = toasts.subscribe

export const remove = ( id: number ) => {
	toasts.update( list => list.filter( i => i.id !== id ) )
}

export const add = ( options: Pick<ToastOptions, 'text' | 'type'> ) => {
	toasts.update( list => {
		const toast = {
			...options,
			id: list.length + 1,
			visible: true
		}
		list.push( toast )
		setTimeout( () => {
			toast.visible = false
			setTimeout( () => {
				remove( toast.id )
			}, 200 )
		}, 5000 )
		return list
	} )
}
