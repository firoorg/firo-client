<template>
    <section>
        <div class="wrap">
            <span
                class="address"
                v-html="formattedAddress"
            />
            <div
                class="meta"
                :class="{ 'has-meta': hasMeta }"
            >
                <div class="label">
                    {{ label }}
                </div>
                <div class="amount">
                    {{ amount }} <span class="unit">xzc</span>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: 'AddressToValidate',

    props: {
        address: {
            type: String,
            required: true
        },

        amount: {
            type: String,
            default: ''
        },

        label: {
            type: String,
            default: ''
        }
    },

    computed: {
        formattedAddress () {
            return this.address.match(/.{1,5}/g).join('&puncsp;')
        },

        hasMeta () {
            return !!this.amount || !!this.label
        }
    }
}
</script>

<style lang="scss" scoped>
    section {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    //.wrap
    .address {
        @include font-monospace();
        font-size: 3.65vw;
    }

    .meta {
        display: flex;
        justify-content: space-between;
        margin-bottom: emRhythm(-2);
        @include font-heavy();
        color: $color--comet;

        &.has-meta {
            margin-top: emRhythm(1);
        }
    }

    .label {
        font-style: italic;
    }

    .amount .unit {
        color: $color--comet-dark;
    }
</style>
