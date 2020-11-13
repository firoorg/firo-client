<template>
    <firo-logo class="firo-logo-text" />
</template>

<script>
import FiroLogo from 'renderer/assets/firo-logo-text.svg'

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
