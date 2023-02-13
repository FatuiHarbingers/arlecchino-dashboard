<script lang="ts">
	export let name: string
</script>

<div class="feature">
	<h3> { name } </h3>
	<p>
		<slot />
	</p>
</div>

<style>
.feature {
	background-color: #0a0e12;
	border-radius: 5px;
	padding: 16px;
	transition: 0.4s;
	width: 200px;
}
.feature:hover {
	background-color: #080a0e;
}
h3 {
	text-align: center;
}
@media ( max-width: 850px ) {
	.feature {
		max-width: 400px;
		text-align: center;
		width: 90%;
	}
}
</style>