import { AmazonPayState } from '../types/AmazonPayState'
import { ActionTree } from 'vuex';
import * as types from './mutation-types'
import config from 'config'
import { adjustMultistoreApiUrl } from '@vue-storefront/core/lib/multistore'
import { json } from 'body-parser';

// it's a good practice for all actions to return Promises with effect of their execution
export const actions: ActionTree<AmazonPayState, any> = {
  login ({ }, accessToken): Promise<Response> {
    let url = `${config.amazonPay.endpoint.login}?access_token=${accessToken}&client_id=${config.amazonPay.clientId}`

    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        mode: 'cors'
      }).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  }
}
