import Vue from 'vue'
import * as types from '~/types/Address'
import rootTypes from '~/types'

const WALLET_ADDRESS_KEY = 'walletAddresses'
const THIRD_PARTY_ADDRESS_KEY = 'thirdPartyAddresses'

const getTxBasics = function (tx) {
    const { txid, category, amount, blockHeight, blockHash, blockTime, firstSeenAt } = tx

    return {
        id: txid,
        category,
        amount,
        firstSeenAt,
        block: {
            height: blockHeight,
            hash: blockHash,
            time: blockTime
        }
    }
}

const state = {
    [WALLET_ADDRESS_KEY]: {},
    [THIRD_PARTY_ADDRESS_KEY]: {}
}

const mutations = {
    [types.ADD_WALLET_ADDRESS] (state, { address, total }) {
        console.log('adding wallet address', address, total)

        Vue.set(state[WALLET_ADDRESS_KEY], address, {
            address,
            total,
            transactions: []
        })
    },

    [types.ADD_THIRD_PARTY_ADDRESS] (state, { address, total }) {
        console.log('adding third party address', address, total)
        Vue.set(state[THIRD_PARTY_ADDRESS_KEY], address, {
            address,
            total,
            transactions: []
        })
    },

    [types.ADD_TRANSACTION] (state, { stack, address, transaction }) {
        state[stack][address].transactions = [
            ...state[stack][address].transactions.filter((tx) => tx.id !== transaction.id),
            transaction
        ]
    }
}

const actions = {
    [types.SET_INITIAL_STATE] ({ commit, dispatch, state }, initialState) {
        console.log(Object.keys(initialState))
        const { addresses } = initialState

        for (const addressKey of Object.keys(addresses)) {
            const address = addresses[addressKey]

            if (!address) {
                continue
            }

            const { txids, total } = address

            if (!txids) {
                console.log('no txids found for address', addressKey)
                break
            }

            console.log('total:', total)

            for (let txCategory of Object.keys(txids)) {
                for (let txid of Object.keys(txids[txCategory])) {
                    const tx = txids[txCategory][txid]
                    const { category } = tx

                    if (!category) {
                        console.log(tx, address)
                        return
                    }

                    switch (category.toLowerCase()) {
                    case 'receive':
                        dispatch(types.ADD_WALLET_ADDRESS, {
                            address: addressKey,
                            total
                        })
                        dispatch(types.ADD_RECEIVE_FROM_TX, tx)
                        break

                    case 'send':
                        dispatch(types.ADD_THIRD_PARTY_ADDRESS, {
                            address: addressKey,
                            total
                        })
                        dispatch(types.ADD_SEND_FROM_TX, tx)
                        // console.log('got send tx', addressKey, tx)
                        break

                    case 'mint':
                        dispatch(types.ADD_MINT_FROM_TX, tx)
                        break

                    case 'spend':
                        dispatch(types.ADD_THIRD_PARTY_ADDRESS, {
                            address: addressKey,
                            total
                        })
                        dispatch(types.ADD_SPEND_FROM_TX, tx)
                        break

                    case 'mined':
                        dispatch(types.ADD_WALLET_ADDRESS, {
                            address: addressKey,
                            total
                        })
                        dispatch(types.ADD_MINED_FROM_TX, tx)
                        break

                    default:
                        console.warn('UNHANDLED ADDRESS CATEGORY', category, tx)
                        break
                    }
                }
            }
        }
    },

    [types.ADD_WALLET_ADDRESS] ({ commit, state }, { address, total }) {
        if (state.walletAddresses[address] !== undefined) {
            return
        }

        commit(types.ADD_WALLET_ADDRESS, { address, total })
    },

    [types.ADD_THIRD_PARTY_ADDRESS] ({ commit, state }, { address, total }) {
        if (state.thirdPartyAddresses[address] !== undefined) {
            return
        }

        commit(types.ADD_THIRD_PARTY_ADDRESS, { address, total })
    },

    [types.ADD_RECEIVE_FROM_TX] ({ commit, dispatch, state }, receiveTx) {
        const txBasics = getTxBasics(receiveTx)
        const { address, amount } = receiveTx

        commit(types.ADD_TRANSACTION, {
            stack: WALLET_ADDRESS_KEY,
            address,
            transaction: {
                ...txBasics,
                amount
            }
        })
    },

    [types.ADD_SEND_FROM_TX] ({ commit }, sendTx) {
        const txBasics = getTxBasics(sendTx)
        const { address, fee } = sendTx

        commit(types.ADD_TRANSACTION, {
            stack: THIRD_PARTY_ADDRESS_KEY,
            address,
            transaction: {
                ...txBasics,
                fee
            }
        })
    },

    [types.ADD_SPEND_FROM_TX] ({ commit }, spendTx) {
        const txBasics = getTxBasics(spendTx)
        const { address, fee } = spendTx

        commit(types.ADD_TRANSACTION, {
            stack: THIRD_PARTY_ADDRESS_KEY,
            address,
            transaction: {
                ...txBasics,
                fee
            }
        })
    },

    [types.ADD_MINT_FROM_TX] ({ commit, dispatch, state }, mintTx) {
        const txBasics = getTxBasics(mintTx)

        const { fee, used } = mintTx

        dispatch(rootTypes.mint.UPDATE_MINT, {
            ...txBasics,
            fee,
            used
        }, { root: true })
    },

    [types.ADD_MINED_FROM_TX] ({ commit, dispatch, state }, minedTx) {
        // todo create virtual payment request
        const txBasics = getTxBasics(minedTx)
        const { address, amount } = minedTx

        commit(types.ADD_TRANSACTION, {
            stack: WALLET_ADDRESS_KEY,
            address,
            transaction: {
                ...txBasics,
                amount
            }
        })
    },

    [types.ON_ADDRESS_SUBSCRIPTION] ({ dispatch, state }, data) {
        try {
            // todo clarify behaviour with @riordant
            const payload = !data.addresses ? { addresses: data } : data
            dispatch(types.SET_INITIAL_STATE, payload)
        } catch (e) {
            console.log(e)
            console.log(data)
        }
    },

    [types.ON_TRANSACTION_SUBSCRIPTION] ({ dispatch, state }, data) {
        // todo clarify behaviour with @riordant
        const payload = !data.addresses ? { addresses: data } : data
        dispatch(types.SET_INITIAL_STATE, payload)
    }
}

const getters = {
    walletAddresses (state, getters, rootState, rootGetters) {
        return Object.values(state[WALLET_ADDRESS_KEY]).map((addr) => {
            const currentBlockHeight = rootGetters['Blockchain/currentBlockHeight']
            const { block, transactions } = addr
            const confirmations = currentBlockHeight && block ? currentBlockHeight - block.height : 0

            return {
                ...addr,
                hasTransactions: !!transactions.length,
                isReused: transactions.length > 1,
                isConfimed: confirmations >= 6,
                confirmations
            }
        })
    },
    thirdPartyAddresses: (state) => Object.values(state[THIRD_PARTY_ADDRESS_KEY]),

    hasAlreadySentToAddress (state) {
        return (address) => {
            return !!(
                state[THIRD_PARTY_ADDRESS_KEY][address] &&
                state[THIRD_PARTY_ADDRESS_KEY][address].transactions &&
                state[THIRD_PARTY_ADDRESS_KEY][address].transactions.length
            )
        }
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
