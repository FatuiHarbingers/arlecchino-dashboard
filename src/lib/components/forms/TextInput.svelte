<script lang="ts">
	export let onChange: ( ( e: unknown ) => void ) | null = null
	export let onInput: ( ( e: unknown ) => void ) | null = null
	export let placeholder: string | null = null
	export let value: string | null = null
</script>

<input type="text" on:change={ onChange } on:input={ onInput } placeholder={ placeholder } value={ value } />

<style>
input {
	background-color: #1c1c25;
	border: 1px solid transparent;
	border-radius: 5px;
	box-shadow: 1px 1px 3px #000;
	color: #fff;
	outline: none;
	padding: 5px 10px;
	width: 250px;
}
input:focus-within {
	border-color: #08f;
}
</style>
