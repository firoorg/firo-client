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

    computed: {
        shouldAutoClose () {
            return true
        }
    },

    methods: {
        startAutoClose () {
            this.autoCloseTimeout = setTimeout(() => {
                if (this.shouldAutoClose) {
                    this.close()
                }
            }, this.closeAfterInSeconds * 1000)
            //this.$log.debug('started auto close timeout')
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
            this.$log.debug('closing...')
            this.autoCloseTimeout = null
        }
    }
}
