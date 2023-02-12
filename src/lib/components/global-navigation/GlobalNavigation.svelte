<script lang="ts">
    import Button from '../ui/Button.svelte'
	import type { APIUser } from 'discord-api-types/v10'

	export let user: APIUser | null = null
</script>
<div class="global-navigation">
	<h1 class="gn__brand">
		<a href="/">
			<img src="/logo.png" alt="logo" height="32" />
		</a>
	</h1>
	<div class="gn__right">
		<a class="gn__item gn-item__dashboard" href="/dashboard"> Dashboard </a>
		{ #if user }
			<div class="gn__item gn-item__avatar">
				<img src="https://cdn.discordapp.com/avatars/{ user.id }/{ user.avatar }.png" width="32" alt="avatar" title="{ user.username }#{ user.discriminator }" />
			</div>
		{ :else }
			<div class="gn__item gn-item__login">
				<Button href="/oauth2/invite" text="Login" />
			</div>
		{ /if }
	</div>
</div>

<style>
.global-navigation {
	align-items: center;
	background-color: #0a0e12;
	box-shadow: 0 0 3px #000;
	display: flex;
	justify-content: space-between;
	padding: 5px 32px;
}
.gn__brand {
	margin: 0;
}
a {
	color: inherit;
	text-decoration: none;
}
a:hover {
	text-decoration: underline;
}
.gn__right {
	align-items: center;
	display: flex;
}
.gn-item__dashboard {
	border-right: 1px solid #fff;
	margin-right: 16px;
	padding-right: 16px;
}
.gn-item__avatar img {
	border-radius: 100%;
}

@media ( max-width: 430px ) {
	.global-navigation {
		flex-wrap: wrap;
		justify-content: center;
		text-align: center;
	}
	.gn__brand {
		flex-grow: 1;
		width: 100%;
	}
}
</style>