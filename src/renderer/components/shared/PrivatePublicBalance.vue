<template>
    <div class="private-public-balance">
        <hr />

        <div class="balance-line">
            <label>Private Balance:</label>
            <amount :amount="availablePrivate" ticker="FIRO" />
        </div>

        <div class="balance-line">
            <label>Public Balance:</label>
            <amount :amount="availablePublic" ticker="FIRO" />
        </div>

        <div class="toggle" :class="[isPrivate ? 'is-private' : 'is-public', disabled ? 'toggle-disabled' : 'toggle-enabled']">
            <label class="toggle-label-private">Private</label>
            <div class="toggle-switch" @click="toggle()">
                <div class="inner" />
            </div>
            <label class="toggle-label-public">Public</label>
        </div>
    </div>
</template>

<script>
// $emits: toggle (isPrivate)
import {mapGetters} from "vuex";
import {convertToCoin} from "lib/convert";
import Amount from "renderer/components/shared/Amount";

export default {
    name: "PrivatePublicBalance",

    components: {
        Amount
    },

    props: {
        value: {
            type: Boolean,
            required: true
        },

        disabled: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            isPrivate: true
        };
    },

    computed: mapGetters({
        availablePrivate: "Balance/availablePrivate",
        availablePublic: "Balance/availablePublic"
    }),

    watch: {
        value: {
            immediate: true,
            handler(v) {
                if (this.isPrivate === v) return;
                this.isPrivate = v;
            }
        }
    },

    methods: {
        convertToCoin,

        toggle() {
            if (this.disabled) return;
            this.isPrivate = !this.isPrivate;
            this.$emit('input', this.isPrivate);
        }
    }
}
</script>

<style scoped lang="scss">
.private-public-balance {
    hr {
        margin-top: 30px;
        opacity: 0.2;
    }

    .balance-line {
        margin-top: 10px;
        display: flex;

        label {
            width: fit-content;
            font-weight: bold;
        }

        .amount {
            flex-grow: 1;
            text-align: right;
            color: var(--color-primary);
            font-weight: bold;
        }
    }

    .toggle {
        margin-top: 15px;

        &.toggle-disabled {
            color: var(--color-text-disabled);
        }

        font-weight: bold;
        user-select: none;

        .toggle-switch {
            height: 0.7em;
            width: 20px;
            padding: 1px;
            display: inline-block;
            background-color: var(--color-text-disabled);
            border-radius: 5px;

            .inner {
                height: 0.7em;
                display: inline-block;
                position: relative;
                width: 10px;
                background-color: var(--color-text-secondary);
                border-radius: 5px;

                @at-root .toggle.is-private {
                    .toggle-label-public {
                        color: var(--color-text-disabled);
                    }

                    .inner {
                        float: left;
                    }
                }

                @at-root .toggle.is-public {
                    .toggle-label-private {
                        color: var(--color-text-disabled);
                    }

                    .inner {
                        float: right;
                    }
                }
            }
        }
    }
}
</style>