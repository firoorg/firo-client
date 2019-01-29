<template>
    <span
        class="status-badge"
        :class="statusColor"
    >
        {{ status }}
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
    }
</style>
