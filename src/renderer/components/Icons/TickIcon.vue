<template>
    <svg height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="m6.5-1.5 4 4-9 8" fill="none" :stroke="strokeColor" stroke-linecap="round" stroke-width="2" transform="matrix(0 1 1 0 3.5 1.5)"/></svg>
</template>

<script>
    export default {
        name: 'TickIcon',

        props: {
            color: {
                type: String,
                default: 'green'
            }
        },

        computed: {
            strokeColor () {
                switch (this.color.toLowerCase()) {
                case 'warning':
                case 'orange':
                    return '#FA8C0F'
                case 'success':
                case 'green':
                    return '#23b852'
                }
            }
        }
    }
</script>
