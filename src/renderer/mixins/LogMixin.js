import Vue from 'vue'

import { createLogger } from '#/lib/logger'

export default {
    beforeCreate () {
        this.$log = createLogger(`vue:${this.name}`)
    }
}
