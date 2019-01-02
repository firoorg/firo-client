import mixin from './mixin'

export default {
    ...mixin,
    ...({
        namespace: 'Znode',
        collection: 'znodeList',

        subscriptions: [
            'znode'
        ]
    })
}
