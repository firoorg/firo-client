<template>
    <div id="app">
        <DebugGrid />
        <router-view />
    </div>
</template>

<script>
import DebugGrid from '@/components/DebugGrid'

export default {
    name: 'ZcoinClient',
    components: {
        DebugGrid
    }
}
</script>

<style>
    @import '../../node_modules/lato-font/css/lato-font.css';
    @import '../../node_modules/typeface-overpass-mono/index.css';
</style>
