<i18n>
    en:
        heading: "Zcoin Balance"
</i18n>

<template>
    <section class="balance" >
        <div class="label">
            {{ $t('navigation.balance.title') }}
            <span />
        </div>
        <span class="amount">
            {{ convertToCoin(availableTotal) }}
        </span>
    </section>
</template>

<script>
import { mapGetters } from 'vuex' /* , mapActions */
import { convertToCoin } from '#/lib/convert'

export default {
    name: 'Balance',

    computed: {
        ...mapGetters({
            availableTotal: 'Balance/availableTotal'
        }),
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
