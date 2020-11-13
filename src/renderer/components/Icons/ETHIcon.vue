<template>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" id="eth"><g fill="none" fill-rule="evenodd"><circle cx="16" cy="16" r="16" fill="#627EEA"></circle><g fill="#FFF" fill-rule="nonzero"><path fill-opacity=".602" d="M16.498 4v8.87l7.497 3.35z"></path><path d="M16.498 4L9 16.22l7.498-3.35z"></path><path fill-opacity=".602" d="M16.498 21.968v6.027L24 17.616z"></path><path d="M16.498 27.995v-6.028L9 17.616z"></path><path fill-opacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.348z"></path><path fill-opacity=".602" d="M9 16.22l7.498 4.353v-7.701z"></path></g></g></svg>
</template>

<script>
import IconColorMixin from 'renderer/mixins/IconColorMixin'

export default {
    name: 'ETHIcon',
    mixins: [IconColorMixin]
}
</script>
