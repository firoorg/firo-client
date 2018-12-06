<template>
    <span :class="['tag', sizeClassName]">
        <slot />
    </span>
</template>

<script>
export default {
    name: 'BaseTag',
    props: {
        size: {
            type: String,
            default: ''
        }
    },

    computed: {
        sizeClassName () {
            return this.size ? 'tag-' + this.size : null
        }
    }
}
</script>

<style scoped>

</style>