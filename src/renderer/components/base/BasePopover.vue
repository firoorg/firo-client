<template>
    <v-popover
        v-bind="$attrs"
        class="popover"
        :popover-class="getPopoverClass"
        :offset="offset"
        :handle-resize="true"
        :auto-hide="this.$attrs['auto-hide'] !== undefined ? this.$attrs['auto-hide'] : false"
        v-on="$listeners"
    >
        <!-- This will be the popover target (for the events and position) -->
        <slot name="target" />

        <template slot="popover">
            <div
                ref="container"
                class="content-wrapper"
            >
                <slot
                    name="content"
                    class="popover-content"
                    @reflow="reflow"
                />
            </div>
        </template>
    </v-popover>
</template>

<script>
import smoothReflow from 'vue-smooth-reflow'
import { mapGetters } from 'vuex'

import { getEventBus } from '@/utils/eventBus'

export default {
    name: 'BasePopover',
    mixins: [
        smoothReflow
    ],
    inheritAttrs: false,

    props: {
        canBlur: {
            type: Boolean,
            default: true
        },
        eventBusName: {
            type: String,
            default: 'popover'
        },
        offset: {
            type: [Number, String],
            default: 12
        }
    },

    data () {
        return {
            msg: ''
        }
    },

    computed: {
        ...mapGetters({
            hasOpenOverlay: 'App/hasOpenOverlay'
        }),

        isBlurred () {
            return this.canBlur && this.hasOpenOverlay
        },

        getPopoverClass () {
            const parent = this.$attrs['popover-class'] || ''
            const classes = parent ? [parent] : []

            return this.isBlurred ? [...classes, 'is-blurred'] : classes
        }
    },

    /*
    created() {
        this.eventBus = getEventBus(this.eventBusName)
        this.eventBus.$on('reflow', () => {
            this.reflowSymbol = Date.now()
        })
    },
    */

    mounted () {
        this.reflow()
    },

    beforeDestroy () {
        //this.eventBus.$off('reflow')
        this.$unsmoothReflow({
            el: this.$refs.container
        })
    },

    methods: {
        reflow () {
            this.$smoothReflow({
                el: this.$refs.container,
                // debug: true,
                transitionEvent: {
                    selector: '.popover-content',
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
    .content-wrapper {
        position: relative;
        max-width: 40rem;
    }
</style>
