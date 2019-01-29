<template>
    <span
        class="status-badge"
        :class="[statusColor, { 'no-text': !showText }]"
    >
        {{ content }}
    </span>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'ZnodeStatus',

    props: {
        status: {
            type: String,
            required: true
        },

        showText: {
            type: Boolean,
            default: true
        }
    },

    computed: {
        ...mapGetters({
            znodeStates: 'Znode/znodeStates'
        }),

        statusColor () {
            return this.znodeStates.reduce((accumulator, state) => {
                return state.states.includes(this.status) ? state.name : accumulator
            }, '')
        },

        content () {
            return this.showText ? this.status: ''
        }
    }
}
</script>

<style lang="scss" scoped>
    .status-badge {
        display: inline-block;
        border-radius: emRhythm(0.5, $silent: true);
        padding: 0.125rem 0.25rem;
        margin: -0.125rem 0;
        background: $color--green;
        color: $color--polo-light;
        @include font-medium();
        @include setType(2, $ms-down1);

        &.pending {
            background: rgba($color--green, 0.5);
        }

        &.needs-attention {
            background: $color--red;
        }

        &.no-text {
            $width: 0.5;
            display: inline-block;
            padding: 0;
            border-radius: emRhythm(0.25, $silent: true);
            width: emRhythm($width * 2.5, $silent: true);
            height: emRhythm($width * 2.5, $silent: true);
            margin-right: emRhythm($width * 2, $silent: true);
        }
    }
</style>
