export default {
    props: {
        onAutoClose: {
            type: Function,
            default: () => {}
        }
    },

    data () {
        return {
            initAutoCloseOnMount: true,
            autoCloseTimeout: null,
            closeAfterInSeconds: 10
        }
    },

    mounted () {
        if (!this.initAutoCloseOnMount) {
            return
        }

        this.startAutoClose()
    },

    beforeDestroy () {
        this.cancelAutoClose()
    },

    methods: {
        startAutoClose () {
            this.autoCloseTimeout = setTimeout(() => {
                this.close()
            }, this.closeAfterInSeconds * 1000)
            console.log('started auto close timeout')
        },

        cancelAutoClose () {
            if (!this.autoCloseTimeout) {
                return
            }

            clearTimeout(this.autoCloseTimeout)
        },

        close () {
            this.$emit('auto-close', true)
            this.onAutoClose()
            console.log('closing...')
            this.autoCloseTimeout = null
        }
    }
}
