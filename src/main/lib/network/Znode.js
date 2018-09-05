// import types from '../../../store/types'
import mixin from './mixin'

export default {
    ...mixin,
    ...({
        namespace: 'Znode',
        collection: 'znodeList'
        /*
        subscriptions: [
            'address',
            'transaction'
        ]
        */
    })
}
