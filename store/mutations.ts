import { MutationTree } from 'vuex'
import * as types from './mutation-types'
import { AmazonPayState } from '../types/AmazonPayState'

export const mutations: MutationTree<AmazonPayState> = {
  [types.SET_AMAZON_PAYMENTS_READY] (state, amazonPaymentsReady) {
    state.amazonPaymentsReady = amazonPaymentsReady
  },
  [types.SET_ORDER_REFERENCE_ID] (state, orderReferenceId) {
    state.orderReferenceId = orderReferenceId
  },
  // [types.SET_USER_ID] (state, userId) {
  //   state.userId = userId
  // },
  [types.SET_USER_TOKEN] (state, userToken) {
    state.userToken = userToken
  }
}