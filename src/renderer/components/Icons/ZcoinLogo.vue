<template>
    <zcoin-logo class="zcoin-logo" />
</template>

<script>
import ZcoinLogo from 'renderer/assets/zcoin-logo.svg'

export default {
    name: 'LogoText',
    components: {
        ZcoinLogo
    }
}
</script>

<style scoped>
    .zcoin-logo-text {
        @include drop-shadow();
    }
</style>
