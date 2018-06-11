<template>
    <v-popover
            v-bind="$attrs"
            class="popover"
            offset="12"
            :auto-hide="false"
    >
        <!-- This will be the popover target (for the events and position) -->
        <slot name="target" />

        <!-- This will be the content of the popover -->
        <template slot="popover">
            <div class="content-wrapper">
                <slot name="content" />
                <input class="tooltip-content" v-model="msg" placeholder="Tooltip content" />
                <p>
                    {{ msg }}
                </p>

                <footer>
                    <slot name="footer" />
                </footer>
            </div>
            <!-- You can put other components too -->
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
        max-width: 25rem;

        footer {
            text-align: right;
        }
    }
</style>