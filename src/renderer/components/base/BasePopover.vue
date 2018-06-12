<template>
    <v-popover
            v-bind="$attrs"
            class="popover"
            offset="12"
            :auto-hide="false"
    >
        <!-- This will be the popover target (for the events and position) -->
        <slot name="target" />

        <template slot="popover">
            <div class="content-wrapper">
                <slot name="content" />
            </div>
        </template>
    </v-popover>
</template>

<script>
    export default {
        name: 'BasePopover',
        inheritAttrs: false,

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
        max-width: 30rem;
    }
</style>