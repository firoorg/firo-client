<template>
    <div class="status">
        <h1 v-if="isLoading">Loading</h1>
        <template v-else-if="isError">
            <div class="icon">
                <send-confirmation-check />
            </div>
            <h2>Payment failed! </h2>
            <p>{{ error.message }}</p>
            <em>code {{ error.code }}</em>
        </template>
        <template v-else>
            <div class="icon">
                <send-confirmation-check />
            </div>
            <h2>Payment successfully sent!</h2>
        </template>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'

    import SendConfirmationCheck from '@/components/Icons/SendConfirmationCheck'

    export default {
        name: 'SpendZerocoinStepStatus',
        components: {
            SendConfirmationCheck
        },

        computed: {
            ...mapGetters({
                isLoading: 'SpendZerocoin/isLoading',
                isError: 'SpendZerocoin/currentResponseIsError',
                error: 'SpendZerocoin/currentResponseError'
            })
        }
    }
</script>

<style lang="scss" scoped>
    .icon {
        max-width: emRhythm(15);
        margin: 0 auto emRhythm(2);

        & + h2 {
            margin-bottom: 0;
        }
    }

    .status {
        text-align: center;
    }
</style>