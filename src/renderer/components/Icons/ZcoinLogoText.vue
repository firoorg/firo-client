<template>
    <zcoin-logo class="zcoin-logo-text" />
</template>

<script>
    import ZcoinLogo from '@/assets/zcoin-logo-text.svg'

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
