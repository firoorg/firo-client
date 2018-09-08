import Vue from 'vue'
import * as types from '~/types/Address'
import rootTypes from '~/types'

import LastSeen from '~/mixins/LastSeen'

const lastSeen = LastSeen.module('transaction')

const WALLET_ADDRESS_KEY = 'walletAddresses'
const THIRD_PARTY_ADDRESS_KEY = 'thirdPartyAddresses'

const getTxBasics = function (tx) {
    const { txid, category, amount, blockHeight, blockHash, blockTime, firstSeenAt } = tx

    let block = null

    if (blockHeight && blockHash) {
        block = {
            height: blockHeight,
            hash: blockHash,
            time: blockTime * 1000
        }
    }

    return {
        id: txid,
        category,
        amount,
        firstSeenAt: firstSeenAt,
        block
    }
}

const state = {
    ...lastSeen.state,

    [WALLET_ADDRESS_KEY]: {},
    [THIRD_PARTY_ADDRESS_KEY]: {}
}

const mutations = {
    ...lastSeen.mutations,

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
    ...lastSeen.actions,

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

                    case 'spendin':
                        dispatch(types.ADD_WALLET_ADDRESS, {
                            address: addressKey,
                            total
                        })
                        dispatch(types.ADD_SPEND_IN_FROM_TX, tx)
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

                    case 'spendout':
                        dispatch(types.ADD_THIRD_PARTY_ADDRESS, {
                            address: addressKey,
                            total
                        })
                        dispatch(types.ADD_SPEND_OUT_FROM_TX, tx)
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
        const { address, fee, label } = sendTx

        commit(types.ADD_TRANSACTION, {
            stack: THIRD_PARTY_ADDRESS_KEY,
            address,
            transaction: {
                ...txBasics,
                fee,
                label
            }
        })
    },

    [types.ADD_SPEND_IN_FROM_TX] ({ commit }, spendTx) {
        const txBasics = getTxBasics(spendTx)
        const { address } = spendTx

        console.log(types.ADD_SPEND_IN_FROM_TX, txBasics, Object.keys(spendTx))

        commit(types.ADD_TRANSACTION, {
            stack: WALLET_ADDRESS_KEY,
            address,
            transaction: {
                ...txBasics
            }
        })
    },

    [types.ADD_SPEND_OUT_FROM_TX] ({ commit }, spendTx) {
        const txBasics = getTxBasics(spendTx)
        const { address, label } = spendTx

        console.log(types.ADD_SPEND_OUT_FROM_TX, txBasics, Object.keys(spendTx))

        commit(types.ADD_TRANSACTION, {
            stack: THIRD_PARTY_ADDRESS_KEY,
            address,
            transaction: {
                ...txBasics,
                label
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
    ...lastSeen.getters,

    walletAddresses (state, getters, rootState, rootGetters) {
        const currentBlockHeight = rootGetters['Blockchain/currentBlockHeight']

        return Object.values(state[WALLET_ADDRESS_KEY]).map((addr) => {
            let { transactions: txs } = addr

            let confirmations = 0

            if (txs.length) {
                txs = txs.map((tx) => {
                    const { block } = tx
                    const txConfirmations = currentBlockHeight && block ? currentBlockHeight - block.height : 0

                    return {
                        ...tx,
                        confirmations: txConfirmations
                    }
                })

                confirmations = txs.reduce((accumulator, tx) => {
                    return (tx.confirmations > accumulator) ? tx.confirmations : accumulator
                }, 0)
            }

            //
            //

            return {
                ...addr,
                transactions: txs,
                hasTransactions: !!txs.length,
                isReused: txs.length > 1,
                isConfirmed: confirmations >= 6,
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
    },

    getOutgoingTransactions (state) {
        const addresses = Object.keys(state[THIRD_PARTY_ADDRESS_KEY])

        const txs = addresses.reduce((accumulator, key) => {
            const address = state[THIRD_PARTY_ADDRESS_KEY][key]

            return [ ...accumulator, ...address.transactions ]
        }, [])

        console.log(txs)

        return txs
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
