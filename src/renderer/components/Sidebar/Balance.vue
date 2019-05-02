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
                {{ convertToCoin(availableXzc) }} XZC
                <span
                    v-if="pendingXzc > 0"
                >
                    ({{ convertToCoin(pendingXzc) }} pending)
                </span>
            </div>

            <div
                v-if="confirmedZerocoin > 0 && unconfirmedZerocoin > 0"
                class="zerocoin-total"
            >
                {{ convertToCoin(confirmedZerocoin) }} Zerocoin ({{ convertToCoin(unconfirmedZerocoin) }} pending)
            </div>
            <div
                v-else-if="confirmedZerocoin > 0"
                class="zerocoin-total"
            >
                {{ convertToCoin(confirmedZerocoin) }}
            </div>
            <div
                v-else-if="unconfirmedZerocoin > 0"
                class="zerocoin-total"
            >
                ({{ convertToCoin(unconfirmedZerocoin) }} pending)
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
            unconfirmedXzc: 'Balance/unconfirmedXzc',
            immatureXzc: 'Balance/immatureXzc',

            confirmedZerocoin: 'Balance/confirmedZerocoin',
            unconfirmedZerocoin: 'Balance/unconfirmedZerocoin',
            mints: 'Mint/allMints'
        }),

        pendingXzc () {
            return this.immatureXzc + this.unconfirmedXzc
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
