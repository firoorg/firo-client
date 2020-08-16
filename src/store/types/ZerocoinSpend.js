import IsLoading from 'store/mixins/IsLoading'
import Response from 'store/mixins/Response'

const isLoading = IsLoading.types('')
const spendZerocoinResponse = Response.types('spend zerocoin')

export const SET_FORM_LABEL = 'SET_FORM_LABEL'
export const SET_FORM_AMOUNT = 'SET_FORM_AMOUNT'
export const SET_FORM_ADDRESS = 'SET_FORM_ADDRESS'
export const CLEAR_FORM = 'CLEAR_FORM'

export const SET_CURRENT_PASSPHRASE = 'SET_CURRENT_PASSPHRASE'

// export const CONFIRM_SPEND = 'CONFIRM_SPEND'

export const SPEND_ZEROCOIN = 'SPEND_ZEROCOIN'

export default {
    ...isLoading,
    ...spendZerocoinResponse
}
