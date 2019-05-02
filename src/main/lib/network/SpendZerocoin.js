import mixin from './mixin'
import types from '~/types'

import { createLogger } from '#/lib/logger'

const logger = createLogger('zcoin:network:spendZerocoin')

export default {
    ...mixin,
    ...({
        namespace: 'ZerocoinSpend',
        collection: 'sendPrivate',

        mutations: {
            [types.zerocoinspend.SPEND_ZEROCOIN]: 'spendZerocoin'
        },

        spendZerocoin (payload) {
            // This weird transformation exists because this function has all the information required to switch to the
            // new Sigma API and I didn't want to change the code more than necessary. I guess it should probably be
            // cleaned out and changed on the caller's side if we do a refactor or something.
            let data = {
                label: payload.data.label,
                outputs: [
                    {
                        address: payload.data.address,
                        amount: payload.data.denomination.reduce( (a,denom) => a + denom.amount * denom.value, 0 )
                    }
                ]
            }

            logger.info('SENDING ZEROCOIN: %o', data)

            this.send({
                type: 'create',
                data: data,
                auth: {
                    passphrase: payload.auth.passphrase || null
                }
            }, {
                onSuccess: types.zerocoinspend.ON_SPEND_ZEROCOIN_SUCCESS,
                onError: types.zerocoinspend.ON_SPEND_ZEROCOIN_ERROR
            })
        }
    })
}
