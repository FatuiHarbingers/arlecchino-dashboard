export interface ToastOptions {
	id: number
	text: string
	type: 'success' | 'warn' | 'danger' | 'info'
	visible: boolean
}
