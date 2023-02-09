<script lang="ts">
    import GlobalNavigation from '$lib/components/global-navigation/GlobalNavigation.svelte'

    export let data: import('./$types').PageData
</script>

<GlobalNavigation user={ data.user } />

<slot />