<template>
    <div class="private-public-balance">
        <label class="private-balance-label">PRIVATE BALANCE:</label>
        <div class="private-balance">{{ convertToCoin(availablePrivate) }} <span class="ticker">FIRO</span></div>
        <label class="public-balance-label">PUBLIC BALANCE:</label>
        <div class="public-balance">{{ convertToCoin(availablePublic) }} <span class="ticker">FIRO</span></div>
        <div class="toggle" :class="[isPrivate ? 'is-private' : 'is-public', disabled ? 'toggle-disabled' : 'toggle-enabled']">
            <label class="toggle-label-private">PRIVATE</label>
            <div class="toggle-switch" @click="toggle()">
                <div class="inner" />
            </div>
            <label class="toggle-label-public">PUBLIC</label>
        </div>
    </div>
</template>

<script>
// $emits: toggle (isPrivate)
import {mapGetters} from "vuex";
import {convertToCoin} from "lib/convert";

export default {
    name: "PrivatePublicBalance",

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
        availablePrivate: "Balance/available",
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
@import "src/renderer/styles/sizes";
@import "src/renderer/styles/typography";
@import "src/renderer/styles/inputs";

label {
    @include label();
}

.ticker {
    @include ticker();
}

.private-public-balance {
    @include small();
    margin-top: $size-small-space;

    display: grid;
    grid-gap: $size-tiny-space;

    .private-balance-label {
        grid-row: 1;
        grid-column: 1;
    }

    .private-balance {
        text-align: right;
        grid-row: 1;
        grid-column: 2;
    }

    .public-balance-label {
        grid-row: 2;
        grid-column: 1;
    }

    .public-balance {
        text-align: right;
        grid-row: 2;
        grid-column: 2;
    }

    .toggle {
        &.toggle-disabled {
            opacity: $disabled-input-opacity;
        }

        @include label();
        user-select: none;
        grid-row: 2;
        grid-column: 4;
        justify-self: end;

        .toggle-switch {
            height: 0.7em;
            width: $size-medium-space;
            padding: 1px;
            display: inline-block;
            background-color: black;
            border-radius: 5px;

            .inner {
                height: 0.7em;
                display: inline-block;
                position: relative;
                width: $size-medium-space / 2;
                background-color: red;
                border-radius: 5px;

                @at-root .toggle.is-private {
                    .toggle-label-public {
                        opacity: 0.4;
                    }

                    .inner {
                        float: left;
                    }
                }

                @at-root .toggle.is-public {
                    .toggle-label-private {
                        opacity: 0.4;
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