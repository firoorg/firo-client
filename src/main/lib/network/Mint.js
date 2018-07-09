import types from '~/types'
import mixin from './mixin'

export default {
    ...mixin,
    ...({
        namespace: 'Mint',
        collection: 'mint',

        mutations: {
            [types.mint.DO_MINT]: 'mint'
        },

        mint () {
            console.log('MINTING STARTS')
        }
    })
}
