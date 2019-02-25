<template>
    <main>
        <router-view v-bind="addressToValidate" />
    </main>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'ValidateAddress',

    computed: {
        ...mapGetters({
            addressToValidate: 'AddressValidation/currentAddressToValidate'
        })
    }
}
</script>

<style lang="scss" scoped>
    main {
        padding: emRhythm(6) 0;
        height: 100vh;
        box-sizing: border-box;
        cursor: default;
        color: $color--polo-light;
        user-select: none;
        -webkit-app-region: drag;
    }
</style>
