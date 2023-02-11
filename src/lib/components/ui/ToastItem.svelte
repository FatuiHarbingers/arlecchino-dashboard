<script lang="ts">
	import { fade } from 'svelte/transition'
	import type { ToastOptions } from '$lib/types'

	export let options: ToastOptions

	const colors: Record<typeof options[ 'type' ], string> = {
		danger: '#ef825a',
		info: '#80b8e4',
		success: '#9bcb9f',
		warn: '#f3ac48'
	}

	const hide = () => {
		options.visible = false
	}
</script>

{ #if options.visible }
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="toast" style:--color={ colors[ options.type ] } on:click={ hide } transition:fade="{{ duration: 200 }}">
	{ options.text }
</div>
{ /if }

<style>
.toast {
	background-color: #191d23;
	border-left: 5px solid var( --color );
	border-radius: 5px;
	cursor: pointer;
	padding: 8px 16px;
	transition: 0.3s;
	width: 250px;
}
.toast:hover {
	background-color: #26292f;
}
</style>