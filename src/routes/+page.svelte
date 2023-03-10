<script>
    import Feature from "$lib/components/landing/Feature.svelte"
	import Welcome from "$lib/components/landing/Welcome.svelte"

</script>
<svelte:head>
	<title> Arlecchino - WikiActivity Discord Bot </title>
</svelte:head>

<Welcome />

<h2> Features </h2>
<div class="features">
	<Feature name="Setup quickly">
		No need to edit anything in your wiki or be an admin there. Just tell Arlecchino what wiki to follow and where to forward it!
	</Feature>
	<Feature name="Customization">
		Change the embed's colors, the avatar and name of who sends the activity.
	</Feature>
	<Feature name="Lemon-scented">
		🍋🍋🍋
	</Feature>
</div>

<style>
h2 {
	font-size: 28px;
	margin-top: 32px;
	text-align: center;
}
.features {
	align-items: flex-start;
	column-gap: 48px;
	display: flex;
	justify-content: center;
}
@media ( max-width: 850px ) {
	.features {
		align-items: center;
		flex-direction: column;
		row-gap: 32px;
	}
}
</style>