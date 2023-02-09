<script lang="ts">
	export let css: Record<string, unknown> = {}
	export let disabled = false
	export let href: string | null = null
	export let onClick: ( ( e: unknown ) => void ) | null = null
	export let style: 'normal' | 'smooth' | 'border' = 'normal'
	export let text: string
	export let type: 'primary' | 'danger' | 'success' | 'warn' = 'primary'
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<svelte:element disabled={ disabled } style={ Object.entries( css ).map( ( [ property, value ] ) => `${ property }: ${ value }` ).join( ';' ) } on:click={ onClick } this={ href ? 'a' : 'button' } href={ href } class="btn btn-{ type } btn-style-{ style }">
	{ text }
</svelte:element>

<style>
.btn {
	--color: 50, 117, 235;
	background-color: rgb( var( --color ) );
	border: 0;
	border-radius: 3px;
	color: inherit;
	cursor: pointer;
	display: inline-block;
	font-size: 16px;
	outline: none;
	padding: 5px 10px;
	transition: background 0.4s;
}
.btn:disabled {
	cursor: not-allowed;
	filter: grayscale( 0.5 );
}
.btn:hover {
	--color: 42, 94, 183;
}
.btn-danger {
	--color: 231, 54, 44;
}
.btn-danger:hover {
	--color: 181, 42, 35;
}
.btn-success {
	--color: 47, 159, 76;
}
.btn-success:hover {
	--color: 33, 116, 56;
}
.btn-warn {
	--color: 219, 157, 23;
}
.btn-warn:hover {
	--color: 134, 94, 13;
}
.btn-style-smooth {
	background-color: rgba( var( --color ), 0.2 );
	color: rgb( var( --color ) );
}
.btn-style-smooth:hover {
	background-color: rgba( var( --color ), 0.3 );
}
.btn-style-border {
	background-color: transparent;
	border: 1px solid rgb( var( --color ) );
	color: rgb( var( --color ) );
}
a {
	color: inherit;
	text-decoration: none;
}
</style>