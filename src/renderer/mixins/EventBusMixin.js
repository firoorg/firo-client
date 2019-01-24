import { getEventBus } from '@/utils/eventBus'

export default {
    data () {
        return {
            eventBusName: ''
        }
    },

    created () {
        if (!this.eventBusName) {
            if (process.env.NODE_ENV !== 'production') {
                this.$log.warn('event bus mixin added but no `eventBusName` provided')
            }

            return
        }

        this.eventBus = getEventBus(this.eventBusName)
    },
}
