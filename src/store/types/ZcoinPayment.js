import Payment from '~/mixins/Payments'

const pendingPayment = Payment.types('zcoin')

// export const SET_INITIAL_STATE = 'SET_INITIAL_STATE'
export const SET_AVAILABLE_FEES = 'SET_AVAILABLE_FEES'

export const SET_FORM_LABEL = 'SET_FORM_LABEL'
export const SET_FORM_AMOUNT = 'SET_FORM_AMOUNT'
export const SET_FORM_ADDRESS = 'SET_FORM_ADDRESS'

export const ADD_PAYMENT_TO_QUEUE = 'ADD_PAYMENT_TO_QUEUE '
export const REMOVE_PAYMENT_FROM_QUEUE = 'REMOVE_PAYMENT_FROM_QUEUE'

export const CONFIRM_PAYMENT = 'CONFIRM_PAYMENT'
export const SEND_PAYMENT = 'SEND_PAYMENT'
export const SET_FEE = 'SET_FEE'

export const CALC_TX_FEE = 'CALC_TX_FEE'
export const SET_TX_FEE = 'SET_TX_FEE'
export const SEND_ZCOIN = 'SEND_ZCOIN'

// export mixed in types
export default {
    ...pendingPayment
}
