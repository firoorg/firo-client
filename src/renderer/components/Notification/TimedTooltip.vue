<template>
    <base-popover
        :open="isOpen"
        placement="top"
        :popover-class="popoverClass + ' notice'"
        class="timed-popover"
        :boundaries-element="boundariesElement"
        trigger="manually"
    >
        <template slot="target">
            <slot />
        </template>

        <template slot="content">
            <slot name="content" />
        </template>
    </base-popover>
</template>

<script>
export default {
    name: 'TimedTooltip',
    props: {
        isOpen: {
            type: Boolean,
            required: true
        },
        boundariesElement: {
            required: false
        },
        popoverClass: {
            type: String
        },
        tabindex: {
            type: String
        },
        timeout: {
            type: Number,
            default: 2000
        },
        onTimeout: {
            type: Function,
            required: true
        }
    },

    data () {
        return {
            isOpenTimeout: null
        }
    },

    watch: {
        isOpen: {
            handler (newVal, oldVal) {
                if (newVal && !oldVal) {
                    console.log('opening')
                    this.open()
                } else if (!newVal && oldVal) {
                    console.log('closing')
                    this.close()
                }
            },
            immediate: true
        }
    },

    beforeDestroy () {
        this.close()
    },

    methods: {
        open () {
            this.isOpenTimeout = setTimeout(() => {
                this.close()
            }, this.timeout)
        },

        close () {
            this.onTimeout()
            if (this.isOpenTimeout) {
                clearTimeout(this.isOpenTimeout)
                this.isOpenTimeout = null
            }
        }
    }
}
</script>

<style scoped>
    .timed-popover {
        display: inline-block;
    }
</style>