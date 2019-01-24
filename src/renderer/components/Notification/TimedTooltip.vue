<template>
    <base-popover
        :open="isOpen"
        placement="top"
        :popover-class="popoverClass + ' notice'"
        class="timed-popover"
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
        popoverClass: {
            type: String,
            default: ''
        },
        tabindex: {
            type: String,
            default: '-1'
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
                    this.open()
                } else if (!newVal && oldVal) {
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
