<template>
    <div id="wait-overlay">
        <LoadingHourglass />
    </div>
</template>

<script>
import LoadingHourglass from "renderer/components/Icons/LoadingHourglass";

export default {
    name: "WaitOverlay",
    components: {LoadingHourglass}
}
</script>

<style scoped>

</style>