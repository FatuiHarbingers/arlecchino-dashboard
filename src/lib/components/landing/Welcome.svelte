<script>
    import Button from "$lib/components/ui/Button.svelte";

</script>

<div class="welcome">
	<div class="w__left">
		<h2> Get your wiki's activity on Discord </h2>
		<p> Arlecchino is a Discord bot that keeps track of all news in your wiki's Recent Changes, Social Activity and Logs to send them to your Discord server. </p>
		<Button href="/dashboard" text="Try it now!" type="primary" />
	</div>
	<div class="w__right">
		<img width="196" src="https://cdn.discordapp.com/avatars/1071136383407759541/0b119bc0b816633a95d9e94b663fcff3.png?size=256" alt="Arlecchino" />
	</div>
</div>

<style>
.welcome {
	align-items: center;
	display: flex;
	margin: 16px 32px;
}
.w__left {
	flex-basis: 60%;
}
.w__right {
	align-items: center;
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	row-gap: 8px;
}
.w__right img {
	border-radius: 100%;
}
@media ( max-width: 660px ) {
	.welcome {
		flex-direction: column-reverse;
		text-align: center;
	}
}
</style>