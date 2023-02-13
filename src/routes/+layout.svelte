<script lang="ts">
    import GlobalNavigation from '$lib/components/global-navigation/GlobalNavigation.svelte'
    import Toasts from '$lib/components/ui/Toasts.svelte';

    export let data: import('./$types').PageData
</script>

<GlobalNavigation user={ data.user } />
<Toasts />

<slot />
