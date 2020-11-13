<template>
    <firo-logo class="firo-logo" />
</template>

<script>
import FiroLogo from 'renderer/assets/firo-logo.svg'

export default {
    name: 'LogoText',
    components: {
        FiroLogo
    }
}
</script>

<style scoped>
    .firo-logo-text {
        @include drop-shadow();
    }
</style>
