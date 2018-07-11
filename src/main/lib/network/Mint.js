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

        convertToDenominationAmountPair (list, key) {
            let out = {}

            list.forEach((pair) => {
                const { amount } = pair
                out[pair[key]] = amount
            })

            return out
        },

        mint ({ denominations }) {
            console.log('MINTING STARTS')
            const denoms = this.convertToDenominationAmountPair(denominations, 'denomination')

            console.log(denoms)

            this.send({
                type: 'create',
                data: {
                    denominations: denoms
                }
            })
        }
    })
}
