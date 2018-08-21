<template>
    <v-popover
            v-bind="$attrs"
            v-on="$listeners"
            class="popover"
            :popover-class="getPopoverClass"
            :offset="offset"
            :auto-hide="this.$attrs['auto-hide'] !== undefined ? this.$attrs['auto-hide'] : false"
    >
        <!-- This will be the popover target (for the events and position) -->
        <slot name="target" />

        <template slot="popover">
            <div class="content-wrapper" ref="container">
                <slot name="content" />
            </div>
        </template>
    </v-popover>
</template>

<script>
    import smoothReflow from 'vue-smooth-reflow'
    import { mapGetters } from 'vuex'

    export default {
        name: 'BasePopover',
        inheritAttrs: false,
        mixins: [
            smoothReflow
        ],

        props: {
            canBlur: {
                type: Boolean,
                default: true
            },
            offset: {
                type: Number,
                default: 12
            }
        },

        mounted () {
            console.log(this.$attrs)
            this.$smoothReflow({
                el: this.$refs.container
            })
        },

        beforeDestroy () {
            this.$smoothReflow({
                el: this.$refs.container
            })
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
        }
    }
</script>

<style lang="scss" scoped>
    .content-wrapper {
        position: relative;
        max-width: 35rem;
    }
</style>