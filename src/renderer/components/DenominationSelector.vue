<template>
    <section class="denomination-selector">
        <denomination v-for="denomination in denominations"
                      :key="denomination"
                      :denomination="denomination">
        </denomination>
    </section>
</template>

<script>
    import Denomination from '@/components/Denomination'

    export default {
        name: 'DenominationSelector',
        components: {
            Denomination
        },

        data () {
            return {
                denominations: [1, 10, 25, 50, 100]
            }
        }
    }
</script>

<style lang="scss" scoped>
    .denomination-selector {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        height: 300px;
    }
</style>