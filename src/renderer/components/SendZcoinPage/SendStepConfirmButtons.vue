<template>
    <base-button v-if="isTimerDone"
                 :disabled="!canSubmit"
                 :color="color"
                 @click.prevent="actions.goTo('passphrase')" tabindex="4">
        <span v-if="!hasPendingPayments">{{ $tc('send.public.detail-public-send.button__send--primary', pendingPaymentsSize, { count: pendingPaymentsSize }) }}</span>
        <span v-else>{{ $tc('send.public.detail-public-send.button__send--primary', pendingPaymentsSize, { count: pendingPaymentsSize }) }}</span>
    </base-button>
    <circular-timer v-else
                    key="confirm-timer"
                    class="circular-timer"
                    :complete="onTimerDone" />
</template>

<script>
    import { mapGetters } from 'vuex'
    // import types from '~/types'

    import CircularTimer from '@/components/Icons/CircularTimer'

    export default {
        name: 'SendStepConfirmButtons',
        components: {
            CircularTimer
        },
        props: {
            actions: {
                type: Object,
                required: true
            },
            canSubmit: {
                type: Boolean,
                default: false
            },
            color: {
                type: String
            },
            isTimerDone: {
                type: Boolean,
                default: false
            }
        },

        data () {
            return {
                // timerDone: false
                // confirmed: false,
                // minCellWidth: 0
            }
        },

        beforeCreate () {
            this.$parent.$emit('can-submit', false)
            this.$parent.$emit('can-cancel', false)
        },

        computed: {
            ...mapGetters({
                hasPendingPayments: 'ZcoinPayment/hasPendingZcoinPayments',
                pendingPaymentsSize: 'ZcoinPayment/pendingZcoinPaymentsSize'
            })
        },

        methods: {
            onTimerDone () {
                // this.timerDone = true
                this.$parent.$emit('is-confirmed', true)
                this.$parent.$emit('can-submit', true)
                this.$parent.$emit('can-cancel', true)
                window.dispatchEvent(new Event('resize'))
            }
        }

    }
</script>

<style scoped>

</style>
