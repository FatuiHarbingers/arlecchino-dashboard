<script lang="ts">
    import { toasts } from '$lib/stores/Toasts'
    import ToastItem from './ToastItem.svelte';
</script>

<div class="toasts">
	{ #each $toasts as toast }
		<ToastItem options={ toast } />
	{ /each }
</div>

<style>
.toasts {
	align-items: center;
	display: flex;
	flex-direction: column;
	margin-top: 1em;
	row-gap: 1em;
	position: fixed;
	right: 16px;
	top: 32px;
}
</style>