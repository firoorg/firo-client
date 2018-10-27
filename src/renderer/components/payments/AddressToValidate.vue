<template>
    <section>
        <div v-html="formattedAddress" />
    </section>
</template>

<script>
    export default {
        name: 'AddressToValidate',

        props: {
            address: {
                type: String,
                required: true
            }
        },

        computed: {
            formattedAddress () {
                return this.address.match(/.{1,5}/g).join('&puncsp;')
            }
        }
    }
</script>

<style lang="scss" scoped>
    section {
        font-family: 'Overpass Mono';
        font-weight: bold;
        font-size: 3.65vw;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
    }
</style>
