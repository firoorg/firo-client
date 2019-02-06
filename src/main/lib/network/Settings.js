import mixin from './mixin'
import types from '~/types'

export default {
    ...mixin,
    ...({
        namespace: 'Settings',
        collection: 'setting'
    })
}
