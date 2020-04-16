import Vue from 'vue'
import PerfectScrollbar from 'perfect-scrollbar'

const cache = new WeakMap()

export default {
    bind (el, binding) {
        if (typeof window === 'undefined') {
            return
        }

        const defaults = {
            suppressScrollX: true
        }

        Vue.nextTick(() => {
            const perfectScrollbar = new PerfectScrollbar(el, Object.assign(defaults, binding.value))
            cache.set(el, perfectScrollbar)
        })
    },

    update (el) {
        const perfectScrollbar = cache.get(el)

        if (perfectScrollbar) {
            perfectScrollbar.update()
        }
    },

    componentUpdated (el) {
        const perfectScrollbar = cache.get(el)

        if (perfectScrollbar) {
            perfectScrollbar.update()
        }
    },

    unbind (el) {
        const perfectScrollbar = cache.get(el)
        cache.delete(el)

        if (perfectScrollbar) {
            perfectScrollbar.destroy()
        }
    }
}
