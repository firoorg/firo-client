import * as types from '../types/Address'
import rootTypes from '../types'

const state = {
    addresses: {
    }
}

const mutations = {
}

const actions = {
    [types.SET_INITIAL_STATE] ({ commit, dispatch, state }, initialState) {
        console.log(Object.keys(initialState))

        for (const addressKey of Object.keys(initialState)) {
            const address = initialState[addressKey]

            const { txids, total } = address

            if (!txids) {
                console.log('no txids found for address', addressKey)
                break
            }

            console.log('total:', total)

            for (let txid of Object.keys(txids)) {
                const tx = txids[txid]
                // console.log(tx)

                const { category } = tx
                console.log('category', category)

                if (!category) {
                    console.log(tx, address)
                    return
                }

                switch (category.toLowerCase()) {
                case 'send':
                    // console.log('got send tx', addressKey, tx)
                    break
                case 'mint':
                    dispatch(types.ADD_MINT_FROM_TX, tx)
                    break
                case 'spend':
                    console.log('spend tx', tx)
                    break
                }
            }
        }
    },

    [types.ADD_MINT_FROM_TX] ({ commit, dispatch, state }, mintTx) {
        const { amount, blockhash, blocktime, confirmations, fee, timereceived, txid } = mintTx

        dispatch(rootTypes.mint.UPDATE_MINT, {
            amount,
            confirmations,
            fee,
            timereceived,
            block: {
                hash: blockhash,
                time: blocktime
            },
            id: txid
        }, { root: true })
    }
}

const getters = {
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
