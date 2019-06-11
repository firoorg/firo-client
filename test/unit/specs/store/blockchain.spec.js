/* eslint-disable no-unused-expressions */

import { expect } from 'chai'
import { mutations } from '~/modules/Blockchain'

// destructure assign `mutations`
describe('mutations', () => {
    it('should correctly set the connections', () => {
        const { SET_CONNECTIONS } = mutations

        // mock state
        const state = { connections: 0 }

        // apply mutation
        SET_CONNECTIONS(state, 1)

        // assert result
        expect(state.connections).to.equal(1)
    })

    it('should correctly set the current block height an timestamp', () => {
        const { SET_CURRENT_BLOCK } = mutations
        // mock state
        const state = {
            currentBlock: {
                height: 0,
                timestamp: 0
            }
        }

        // apply mutation
        SET_CURRENT_BLOCK(state, {
            height: 1000,
            timestamp: 123456789
        })

        // assert result
        expect(state.currentBlock).to.deep.equal({
            height: 1000,
            timestamp: 123456789
        })
    })

    it('should correctly set the IS_BLOCKCHAIN_SYNCED status', () => {
        const { IS_BLOCKCHAIN_SYNCED } = mutations

        // mock state
        const state = {
            status: {
                foo: 'bar',
                bar: 'foo',
                isBlockchainSynced: false
            }
        }

        // apply mutation
        IS_BLOCKCHAIN_SYNCED(state, true)

        // assert result
        expect(state.status).to.deep.equal({
            foo: 'bar',
            bar: 'foo',
            isBlockchainSynced: true
        })
    })

    it('should correctly set the IS_FAILED status', () => {
        const { IS_FAILED } = mutations

        // mock state
        const state = {
            status: {
                foo: 'bar',
                bar: 'foo',
                isFailed: false
            }
        }

        // apply mutation
        IS_FAILED(state, true)

        // assert result
        expect(state.status).to.deep.equal({
            foo: 'bar',
            bar: 'foo',
            isFailed: true
        })
    })

    it('should correctly set the IS_SYNCED status', () => {
        const { IS_SYNCED } = mutations

        // mock state
        const state = {
            status: {
                foo: 'bar',
                bar: 'foo',
                isSynced: false
            }
        }

        // apply mutation
        IS_SYNCED(state, true)

        // assert result
        expect(state.status).to.deep.equal({
            foo: 'bar',
            bar: 'foo',
            isSynced: true
        })
    })

    it('should correctly set the IS_WINNERS_LIST_SYNCED status', () => {
        const { IS_WINNERS_LIST_SYNCED } = mutations

        // mock state
        const state = {
            status: {
                foo: 'bar',
                bar: 'foo',
                isWinnersListSynced: false
            }
        }

        // apply mutation
        IS_WINNERS_LIST_SYNCED(state, true)

        // assert result
        expect(state.status).to.deep.equal({
            foo: 'bar',
            bar: 'foo',
            isWinnersListSynced: true
        })
    })

    it('should correctly set the IS_ZNODE_LIST_SYNCED status', () => {
        const { IS_ZNODE_LIST_SYNCED } = mutations

        // mock state
        const state = {
            status: {
                foo: 'bar',
                bar: 'foo',
                isZnodeListSynced: false
            }
        }

        // apply mutation
        IS_ZNODE_LIST_SYNCED(state, true)

        // assert result
        expect(state.status).to.deep.equal({
            foo: 'bar',
            bar: 'foo',
            isZnodeListSynced: true
        })
    })
})
