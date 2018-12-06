<template>
    <base-button
        v-if="isTimerDone"
        :disabled="!canSubmit"
        :color="color"
        tabindex="4"
        @click.prevent="actions.goTo('passphrase')"
    >
        <span v-if="!hasPendingPayments">
            {{ $tc('send.public.detail-public-send.button__send--primary', 1) }}
        </span>
        <span v-else>
            {{ $tc('send.public.detail-public-send.button__send--primary', pendingPaymentsSize, { count: pendingPaymentsSize }) }}
        </span>
    </base-button>
    <circular-timer
        v-else
        key="confirm-timer"
        class="circular-timer"
        :complete="onTimerDone"
    />
</template>

<script>
import { mapGetters } from 'vuex'

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

    computed: {
        ...mapGetters({
            hasPendingPayments: 'ZcoinPayment/hasPendingZcoinPayments',
            pendingPaymentsSize: 'ZcoinPayment/pendingZcoinPaymentsSize'
        })
    },

    beforeCreate () {
        this.$parent.$emit('can-submit', false)
        this.$parent.$emit('can-cancel', false)
    },

    methods: {
        onTimerDone () {
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
