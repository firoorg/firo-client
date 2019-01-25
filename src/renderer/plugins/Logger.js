import { createLogger } from '#/lib/logger'

const Logger = {
    install(Vue, options) {
        Vue.prototype.$log = createLogger(`vue:${name}`)
        /*
        Vue.prototype.$log = function (methodOptions) {
            // some logic ...
        }
        */
    }
}

export default Logger
