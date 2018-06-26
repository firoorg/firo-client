<template>
    <v-popover
            v-bind="$attrs"
            class="popover"
            offset="12"
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
    import smoothHeight from 'vue-smooth-height'

    export default {
        name: 'BasePopover',
        inheritAttrs: false,
        mixins: [
            smoothHeight
        ],

        mounted () {
            this.$smoothElement({
                el: this.$refs.container
            })
        },
        data () {
            return {
                msg: ''
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