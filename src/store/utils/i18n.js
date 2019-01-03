import { isEqual } from 'lodash'

import { convertToSatoshi } from '#/lib/convert'

const isZnodeAddress = function (transactions) {
    // check if it's a new znode address with collateral
    const [ collateralTx, ...potentialMiningTx ] = transactions

    // znodes start with a collateral
    if (collateralTx.amount !== convertToSatoshi(1000)) {
        return false
    }

    // and have
    console.log('received 1000 xzc in the first tx. good chance it is a znode....')

    if (potentialMiningTx && potentialMiningTx.length) {
        return potentialMiningTx.some((tx) => tx.category === 'mined')
    }

    return true
}

// if no label provided the client tries to come up with a good default
export const getLabelForPaymentRequest = function ({ request, transactions, rootState, rootGetters }) {
    const { address } = request
    const tags = transactions.reduce((accumulator, tx) => {
        const tag = `#${tx.category}`

        return accumulator.includes(tag) ? accumulator : [...accumulator, tag]
    }, [])


    if (isZnodeAddress(transactions)) {
        const myNode = rootGetters['Znode/getMyZnode'](address)

        if (myNode) {
            return `${myNode.label} #znode #virtual`
        }
    }

    return 'Payment Request' + (tags.length ? ` ${tags.join(' ')}` : '') + ' #virtual'
}
