import { apiStatus } from '../../../lib/util'
import { Router } from 'express'

module.exports = ({ config, db }) => {
  let AmazonPayApi = Router()

  AmazonPayApi.get('/login', (req, res) => {
    let request = require('request')
    let decodedAccessToken = decodeURIComponent(req.query.access_token)
    let encodeAccessToken = encodeURIComponent(decodedAccessToken)
    let clientId = req.query.client_id

    // let url = `https://${sandbox_str}.amazon.com/`

    request({
      url: config.extensions.amazonPay.api.url + '/auth/o2/tokeninfo',
      method: 'GET',
      qs: {
        access_token: encodeAccessToken
      }
    }, (error, response, body) => {
      if (error) {
        apiStatus(res, error, 500)
      } else {
        let result = JSON.parse(body)

        if (result['aud'] !== clientId) {
          apiStatus(res, {message: 'Invalid Access Token'}, 500)
        }

        request({
          url: config.extensions.amazonPay.api.url + '/user/profile',
          method: 'GET',
          auth: {
            bearer: decodedAccessToken
          }
        }, (error, response, body) => {
          if (error) {
            apiStatus(res, error, 500)
          } else {
            apiStatus(res, body, 200)
          }
        })
      }
    })
  })

  return AmazonPayApi
}
