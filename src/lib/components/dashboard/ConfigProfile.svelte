<script lang="ts">
    import { getProfile, profiles, profileTypeString, updateProperty } from "$lib/stores/Profiles";
    import type { ProfileType } from "@arlecchino/api";
    import TextInput from "../forms/TextInput.svelte";
    import Button from "../ui/Button.svelte";

	export let interwiki: string
	export let type: ProfileType

	const defaultAvatar = 'https://cdn.discordapp.com/avatars/1071136383407759541/0b119bc0b816633a95d9e94b663fcff3.png?size=128'
	const defaultColor = 0x0095ae
	const defaultName = 'Arlecchino'

	$: profile = getProfile( $profiles, interwiki, type )

	$: avatar = profile?.avatar ?? defaultAvatar
	$: color = profile?.color ?? defaultColor
	$: name = profile?.name ?? defaultName

	const profileType = profileTypeString[ type ]

	const update = updateProperty.bind( undefined, { interwiki, type } )

	const bindString = ( property: 'avatar' | 'name', e: unknown ) => {
		const event = e as EventTarget & { currentTarget: EventTarget & HTMLInputElement }
		update( property, event.currentTarget.value )
	}

	const bindColor = ( e: unknown ) => {
		const event = e as EventTarget & { currentTarget: EventTarget & HTMLInputElement }
		const value = event.currentTarget.value.match( /^[0-9a-f]{6}$/i )?.at( 0 )
		if ( !value ) return
		update( 'color', parseInt( value, 16 ) )
	}

	const toggleRemoval = () => {
		if ( !profile ) return
		update( 'remove', !profile.remove )
	}

	let collapse = false
	const collapseProfile = () => {
		collapse = !collapse
	}
</script>

<div class="profile { profile?.remove ? 'profile--remove' : '' } { collapse ? 'profile--collapse' : '' }" style:--color={ '#' + color.toString( 16 ).padStart( 6, '0' ) }>
	<div class="profile__control">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class="profile__label" on:click={ collapseProfile }>
			<span class="profile__arrow"> { collapse ? '▶' : '▼' } </span>
			<b>Profile type:</b>
			{ profileType }
		</div>
		<Button text="&times;" type="danger" style="smooth" onClick={ toggleRemoval } />
	</div>

	{ #if collapse }
		<div class="profile__small">
			<div class="profile__colorbox"></div>
			<img src={ avatar } alt="avatar" width="24" height="24" on:error={ e => {
				const target = e.currentTarget
				if ( target instanceof HTMLImageElement ) {
					target.src = defaultAvatar
				}
			} } />
			<span> { name } </span>
		</div>
	{ /if }

	<div class="profile__settings">
		<div class="form-control">
			<label for="avatar"> Avatar URL </label>
			<TextInput value={ profile.avatar } onInput={ bindString.bind( undefined, 'avatar' ) } />
		</div>

		<div class="form-control">
			<label for="name"> Name </label>
			<TextInput value={ profile.name } onInput={ bindString.bind( undefined, 'name' ) } />
		</div>

		<div class="form-control">
			<label for="color"> Color </label>
			<TextInput value={ profile.color?.toString( 16 ).padStart( 6, '0' ) } onInput={ bindColor } />
		</div>
	</div>

	<div class="profile__demo">
		<img class="profile__avatar" src={ avatar } alt="avatar" width="48" height="48" on:error={ e => {
			const target = e.currentTarget
			if ( target instanceof HTMLImageElement ) {
				target.src = defaultAvatar
			}
		} } />
		<div class="profile__name">
			<span class="profile__username"> { name } </span>
			<span class="profile__bot"> bot </span>
			<span class="profile__timestamp"> Today at 12:00 </span>
		</div>
		<div class="profile__embed">
			<div class="embed__description">
				📝 <span class="fake-link">User</span> edited <span class="fake-link">Page</span>. (<span class="fake-link">+ 123</span>)
			</div>
			<div class="embed__footer">
				<img src="https://media.discordapp.net/attachments/1073409338103844904/1076676575606620262/favicon.png" alt="favicon" class="embed__icon" width="16" />
				<div class="embed__text"> Wiki Genshin Impact • 107408 • Today at 6:29 PM </div>
			</div>
		</div>
	</div>
</div>

<style>
.profile {
	border-radius: 5px;
	display: flex;
	flex-direction: column;
	margin-top: 8px;
	padding: 16px;
	text-align: center;
	width: 100%;
}
.profile--remove {
	background-color: rgb(231, 54, 44, 0.1);
}
.profile--collapse .profile__settings,
.profile--collapse .profile__demo {
	display: none;
}
.profile__control {
	display: flex;
	margin-bottom: 8px;
}
.profile__label {
	align-items: center;
	column-gap: 8px;
	cursor: pointer;
	display: flex;
	flex-grow: 1;
	padding-left: 8px;
	text-align: left;
	user-select: none;
}
.profile__arrow {
	font-size: 12px;
}
.profile__settings {
	display: flex;
	justify-content: space-evenly;
}
.form-control {
	display: flex;
	flex-direction: column;
	row-gap: 8px;
	text-align: left;
}
.profile__demo {
	column-gap: 16px;
	display: grid;
	font-family: "Noto Sans", "Helvetica Neue", Arial, Helvetica, sans-serif;
	grid-template-columns: auto auto 1fr;
	margin-top: 16px;
	text-align: left;
}
.profile__avatar {
	border-radius: 100%;
	grid-row: 1 / 3;
}
.profile__name {
	font-weight: bold;
	grid-column: 2 / 3;
	grid-row: 1 / 2;
}
.profile__bot {
	background-color: #5865f2;
	border-radius: 3px;
	font-size: 12px;
	margin: 0 2px;
	padding: 2px 4px;
	text-transform: uppercase;
}
.profile__timestamp {
	color: #56575d;
	font-size: 12px;
}
.profile__embed {
	background-color: #06080b;
	border-left: 4px solid var( --color );
	border-radius: 5px;
	grid-column: 2 / 3;;
	grid-row: 2 / 4;
	margin-top: 8px;
	padding: 16px;
	width: auto;
}
.embed__description {
	white-space: pre-wrap;
}
.embed__footer {
	column-gap: 8px;
	display: flex;
	font-size: 14px;
	margin-top: 12px;
}
.fake-link {
	color: #0a8ccb;
	cursor: pointer;
	font-weight: bold;;
}
.profile__small {
	align-items: center;
	column-gap: 8px;
	display: flex;
	font-size: 14px;
	margin-top: -4px;
	padding-left: 32px;
	text-align: left;
}
.profile__small img {
	border-radius: 100%;
}
.profile__colorbox {
	background-color: var( --color );
	border-radius: 2px;
	height: 12px;
	width: 12px;
}

@media ( max-width: 1180px ) {
	.profile {
		column-gap: 16px;
		flex-direction: row;
		flex-wrap: wrap;
	}
	.profile__control {
		flex-basis: 100%;
	}
	.profile__settings {
		flex-direction: column;
	}
	.profile__demo {
		align-self: flex-start;
		flex-grow: 1;
	}
}
</style>