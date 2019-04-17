<template>
    <textarea
        :value="value"
        :style="{height: height}"
        @input="$emit('input', $event.target.value)"
        @keydown="setAutoHeight"
    />
</template>

<script>
import Vue from 'vue'

export default {
    name: 'BaseTextarea',
    // v-bind="this.$attrs"  -> inheritAttrs: false,
    props: {
        value: {
            type: String,
            required: true
        }
    },

    data () {
        return {
            height: 'auto'
        }
    },

    mounted () {
        this.setAutoHeight()
    },

    methods: {
        setAutoHeight () {
            let oldHeight = this.$el.clientHeight

            this.height = 'auto'

            Vue.nextTick(() => {
                const getStyle = (styles, prop) => {
                    return parseInt((styles.getPropertyValue(prop) || '0px').replace('px', ''))
                }
                let totalHeight = this.$el.scrollHeight
                const styles = window.getComputedStyle(this.$el, null)

                totalHeight -= getStyle(styles, 'padding-top')
                totalHeight -= getStyle(styles, 'padding-bottom')

                if (oldHeight !== totalHeight) {
                    this.height = `${totalHeight}px`
                }
            })
        }
    }
}
</script>

<style scoped>
    textarea {
        resize: none;
    }
</style>
