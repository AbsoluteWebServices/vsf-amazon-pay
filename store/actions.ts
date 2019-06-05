import { AmazonPayState } from '../types/AmazonPayState'
import { ActionTree } from 'vuex'
import config from 'config'
import * as types from './mutation-types'

// it's a good practice for all actions to return Promises with effect of their execution
export const actions: ActionTree<AmazonPayState, any> = {
  // getLoginProfile ({ commit }, accessToken): Promise<Response> {
  //   let decodedAccessToken = decodeURIComponent(accessToken)
  //   let encodeAccessToken = encodeURIComponent(decodedAccessToken)
  //   let sandboxStr = 'api'

  //   if (config.amazonPay.sandbox) {
  //     sandboxStr += '.sandbox'
  //   }

  //   const apiUrl = `https://${sandboxStr}.amazon.com`

  //   return new Promise((resolve, reject) => {
  //     fetch(apiUrl + '/auth/o2/tokeninfo?access_token=' + encodeAccessToken, {
  //       method: 'GET',
  //       mode: 'cors'
  //     }).then(resp => {
  //       resp.json().then(data => {
  //         if (data['aud'] != config.amazonPay.clientId) {
  //           reject(new Error('Invalid Access Token'))
  //         }

  //         resolve(new Promise((resolve, reject) => {
  //           fetch(apiUrl + '/user/profile', {
  //             method: 'GET',
  //             mode: 'cors',
  //             headers: new Headers({
  //               'Authorization': 'bearer ' + decodedAccessToken
  //             })
  //           }).then(res => {
  //             res.json().then(profile => {
  //               commit(types.SET_USER_ID, profile.user_id)
  //               commit(types.SET_USER_TOKEN, decodedAccessToken)
  //               resolve(res)
  //             }).catch(err => {
  //               reject(err)
  //             })
  //           }).catch(err => {
  //             reject(err)
  //           })
  //         }))
  //       }).catch(err => {
  //         reject(err)
  //       })
  //     }).catch(err => {
  //       reject(err)
  //     })
  //   })
  // }
  getOrderReferenceDetails ({ state }): Promise<Response> {
    let encodeAccessToken = encodeURIComponent(state.userToken)
    let url = `${config.amazonPay.endpoint.GetOrderReferenceDetails}?orderReferenceId=${state.orderReferenceId}&accessToken=${encodeAccessToken}`

    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      }).then(resp => {
        resolve(resp.json())
      }).catch(err => {
        reject(err)
      })
    })
  }
}
