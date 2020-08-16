<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        style=" fill:rgb(232, 39, 113);"
    ><path d="M 12 0 C 8.699219 0 6 2.699219 6 6 L 6 11 L 3 11 L 3 24 L 21 24 L 21 11 L 18 11 L 18 6 C 18 2.699219 15.300781 0 12 0 Z M 12 2 C 14.21875 2 16 3.78125 16 6 L 16 11 L 8 11 L 8 6 C 8 3.78125 9.78125 2 12 2 Z"></path></svg>
</template>

<script>
import IconColorMixin from 'renderer/mixins/IconColorMixin'

export default {
    name: 'LockIcon',
    mixins: [IconColorMixin]
}
</script>
