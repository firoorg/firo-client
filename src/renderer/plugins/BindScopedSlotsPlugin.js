export default {
    install: function (Vue, options) {
        Vue.prototype._b = function bindObjectProps (
            data,
            tag,
            value,
            asProp,
            isSync
        ) {
            if (value) {
                if (value === null || typeof value !== 'object') {
                    console.warn(
                        'v-bind without argument expects an Object or Array value',
                        this
                    )
                } else {
                    if (Array.isArray(value)) {
                        var res = {}
                        for (var i = 0; i < value.length; i++) {
                            if (value[i]) {
                                Vue.util.extend(res, value[i])
                            }
                        }
                        value = res
                    }
                    var hash
                    var loop = function (key) {
                        if (
                            key === 'class' ||
                            key === 'style' ||
                            key === 'scopedSlots' || // new code
                            Vue.config.isReservedAttr(key)
                        ) {
                            hash = data
                        } else {
                            var type = data.attrs && data.attrs.type
                            hash = asProp || Vue.config.mustUseProp(tag, type, key)
                                ? data.domProps || (data.domProps = {})
                                : data.attrs || (data.attrs = {})
                        }
                        if (!(key in hash)) {
                            hash[key] = value[key]

                            if (isSync) {
                                var on = data.on || (data.on = {})
                                on[('update:' + key)] = function ($event) {
                                    value[key] = $event
                                }
                            }
                        }
                    }

                    for (var key in value) loop(key)
                }
            }
            return data
        }
    }
}
