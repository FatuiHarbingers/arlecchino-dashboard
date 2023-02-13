<script lang="ts">
    import Footer from '$lib/components/globals/Footer.svelte';
    import GlobalNavigation from '$lib/components/globals/GlobalNavigation.svelte'
    import Toasts from '$lib/components/ui/Toasts.svelte';

    export let data: import('./$types').PageData
</script>

<GlobalNavigation user={ data.user } />
<Toasts />

<main class="container">
    <slot />
</main>

<Footer version={ data.version } />

<style>
.container {
    margin: 0 16px;
}
</style>