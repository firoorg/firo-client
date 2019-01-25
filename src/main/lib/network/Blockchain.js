import mixin from './mixin'

export default {
    ...mixin,
    ...({
        namespace: 'Blockchain',
        collection: 'blockchain',
        subscriptions: ['block']
    })
}
