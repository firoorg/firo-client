// import types from '../../../store/types'
import mixin from './mixin'

export default {
    ...mixin,
    ...({
        namespace: 'Address',
        collection: 'state-wallet',
        subscriptions: ['address']
    })
}
