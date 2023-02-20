<script lang="ts">
	export let onChange: ( ( e: unknown ) => void ) | null = null
	export let value: string | null = null
	export let width: `${ number }px` | `${ number }%` = '250px'
</script>

<select value={ value } on:change={ onChange } style:width>
	<slot />
</select>

<style>
select {
	background-color: #1c1c25;
	border: 1px solid transparent;
	border-radius: 5px;
	box-shadow: 1px 1px 3px #000;
	color: #fff;
	outline: none;
	padding: 5px 10px;
	width: 250px;
}
</style>