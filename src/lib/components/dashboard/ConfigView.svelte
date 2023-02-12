<script lang="ts">
    import type { APIChannel } from 'discord.js';
    import Dropdown from '../forms/Dropdown.svelte';
    import TextInput from '../forms/TextInput.svelte';
    import Button from '../ui/Button.svelte';
	import { s } from '@sapphire/shapeshift'

	export let channels: APIChannel[]
	export let config: {
		avatar?: string
		channel: string
		color: number
		guild: string
		name?: string
		remove: boolean
		wiki: string
	}

	const bindString = ( property: 'avatar' | 'name', e: unknown ) => {
		const event = e as EventTarget & { target: EventTarget & HTMLInputElement }
		if ( event.target.value.length === 0 ) {
			config[ property ] = undefined
		} else {
			config[ property ] = event.target.value
		}
	}

	const bindColor = ( e: unknown ) => {
		const event = e as EventTarget & { target: EventTarget & HTMLInputElement }
		const color = parseInt( event.target.value, 16 )
		if ( event.target.value.length !== 6 || isNaN( color ) || color < 0 || color > 0xffffff ) return
		config.color = color
	}

	const bindChannel = ( e: unknown ) => {
		const event = e as EventTarget & { target: EventTarget & HTMLSelectElement }
		const channel = event.target.value
		config.channel = channel
	}

	const toggleRemove = () => {
		config.remove = !config.remove
	}

	const bindWiki = ( e: unknown ) => {
		const event = e as EventTarget & { target: EventTarget & HTMLInputElement }
		const value = event.target.value.trim()

		if ( value.length === 0 ) {
			config.wiki = ''
			return
		} else if ( value.match( /^([a-z-]{2,5}\.)?[a-z0-9-]+$/ ) ) {
			config.wiki = value
			return
		}

		const url = new URL( value )
		const name = url.hostname.split( '.' ).at( 0 )
		if ( !name || !url.hostname.match( /^[a-z0-9-]+\.fandom\.com$/ ) ) return
		const lang = url.pathname.split( '/' ).at( 1 )
		if ( !lang || lang === 'wiki' ) {
			config.wiki = name
		} else {
			config.wiki = `${ lang }.${ name }`
		}
	}

	let avatar: string | null = null
	try {
		avatar = s.string.url().parse( config.avatar )
	} catch {
		avatar = null
	}
</script>

<div class="config-view" style="--color: #{ config.color.toString( 16 ).padStart( 6, '0' ) }">
	{ #if config.avatar && s.string.url().run( config.avatar ).success }
		<img class="cv__avatar" src={ config.avatar } alt="avatar" />
	{ /if }
	<label for="avatar"> Avatar URL </label>
	<TextInput value={ config.avatar } onInput={ bindString.bind( undefined, 'avatar' ) } />

	<label for="name"> Webhook name </label>
	<TextInput value={ config.name } onInput={ bindString.bind( undefined, 'name' ) } />

	<label for="color"> Color </label>
	<TextInput value={ config.color.toString( 16 ).padStart( 6, '0' ) } onInput={ bindColor } />

	<label for="wiki"> Wiki </label>
	<TextInput value={ config.wiki } onChange={ bindWiki } />

	<label for="channel"> Channel </label>
	<Dropdown value={ config.channel } onChange={ bindChannel }>
		{ #each channels as channel }
			<option value={ channel.id }> #{ channel.name } </option>
		{ /each }
	</Dropdown>

	<br /> <br />
	<Button type={ config.remove ? 'primary' : 'danger' } text={ config.remove ? 'Recover' : 'Remove' } onClick={ toggleRemove } />
	{ #if config.remove }
		<span style="color: red;">
			This configuration is marked to be removed if you save your changes.
		</span>
	{ /if }
	<br /> <br />
</div>

<style>
.config-view {
	background-color: rgba( 0, 0, 0, 0.3 );
	border-left: 5px solid var( --color );
	border-radius: 5px;
	margin-left: auto;
	margin-right: auto;
	margin-top: 24px;
	padding: 16px;
}
label {
	display: block;
	margin-bottom: 8px;
}
label:not(:first-of-type) {
	margin-top: 8px;
}
.cv__avatar {
	float: right;
	margin: 16px;
}
</style>