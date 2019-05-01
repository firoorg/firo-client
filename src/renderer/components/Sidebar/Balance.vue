<i18n>
    en:
        heading: "Zcoin Balance"
</i18n>

<template>
    <section class="balance">
        <div class="label">
            {{ $t('navigation.balance.title') }}
            <span />
        </div>
        <div class="amount">
            <div class="confirmed-total">
                {{ convertToCoin(availableXzc) }}
            </div>

            <div
                v-if="pendingTotal > 0"
                class="pending-total"
            >
                ({{ convertToCoin(pendingTotal) }} pending)
            </div>

            <div
                v-if="availableZerocoin > 0"
                class="zerocoin-total"
            >
                {{ convertToCoin(availableZerocoin) }} Zerocoin
            </div>
        </div>
    </section>
</template>

<script>
import { mapGetters } from 'vuex' /* , mapActions */
import { convertToCoin } from '#/lib/convert'

export default {
    name: 'Balance',

    computed: {
        ...mapGetters({
            availableXzc: 'Balance/availableXzc',
            availableZerocoin: 'Balance/availableZerocoin',
            unconfirmedTotal: 'Balance/unconfirmedTotal',
            immatureTotal: 'Balance/immatureTotal'
        }),

        pendingTotal () {
            return this.immatureTotal + this.unconfirmedTotal
        }
    },

    methods: {
        convertToCoin
    }
}
</script>

<style lang="scss" scoped>
    .label,
    .amount {
        display: block;
        @include setType(3);
    }

    .pending-total {
        font-size-adjust: -80%;
        color: lightsalmon;
    }

    .balance {
        margin-top: emRhythm(0.69, $silent: true);
    }

    .amount {
        margin-top: emRhythm(1);
        color: #23B852;
        opacity: .8;
        transition: all .15s ease-in-out;
        //text-shadow: 0 0 10px $color--green-bright;
        cursor: default;
    }
</style>
