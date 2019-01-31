import IsLoading from '~/mixins/IsLoading'
import Response from '~/mixins/Response'

const isLoading = IsLoading.types('')
const mintResponse = Response.types('mint')

export const ADD_DENOMINATION = 'ADD_DENOMINATION'
export const REMOVE_DENOMINATION = 'REMOVE_DENOMINATION'
export const RESET_DENOMINATIONS = 'RESET_DENOMINATIONS'

export const UPDATE_MINT = 'UPDATE_MINT'
export const ON_MINTSTATUS_SUBSCRIPTION = 'ON_MINTSTATUS_SUBSCRIPTION'
export const DO_MINT = 'DO_MINT'

export default {
    ...isLoading,
    ...mintResponse
}
