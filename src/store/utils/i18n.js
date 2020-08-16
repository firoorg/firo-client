import { isEqual } from 'lodash'

import { convertToSatoshi } from 'lib/convert'

const isZnodeAddress = function (transactions) {
    // check if it's a new znode address with collateral
    const [ collateralTx, ...potentialMiningTx ] = transactions

    // znodes start with a collateral
    if (collateralTx.amount !== convertToSatoshi(1000)) {
        return false
    }

    if (potentialMiningTx && potentialMiningTx.length) {
        return potentialMiningTx.some((tx) => tx.category === 'mined')
    }

    return true
}

// if no label provided the client tries to come up with a good default
export const getLabelForPaymentRequest = function ({ request, transactions, rootState, rootGetters }) {
    const { address } = request

    if (isZnodeAddress(transactions)) {
        const myNode = rootGetters['Znode/getMyZnode'](address)

        if (myNode) {
            return `${myNode.label} -- #Znode Reward`
        }
    }

    if (transactions.find((tx) => tx.category === 'mined')) {
        return '#Mining Reward'
    }

    return 'Incoming Transaction'
}
