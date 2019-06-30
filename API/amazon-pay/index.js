import { apiStatus } from '../../../lib/util'
import { Router } from 'express'
import HmacSHA256 from 'crypto-js/hmac-sha256'
import Base64 from 'crypto-js/enc-base64'
import { URL } from 'url'
import { parseString } from 'xml2js'
import uuidv1 from 'uuid/v1'
import CollapseLib from './lib/collapse-dict'

const ALGORITHM = 'HmacSHA256'

const calculateStringToSignV2 = (parameters, method, { hostname, pathname }) => {
  const sorted = {}
  Object.keys(parameters).sort().forEach((key) => {
    sorted[key] = encodeURIComponent(parameters[key])
  })

  let data = `${method}\n${hostname}\n${pathname}\n`

  for (const key in sorted) {
    if (sorted.hasOwnProperty(key)) {
      const value = sorted[key]
      if (value != null) {
        data += `${key}=${value}`
      } else {
        data += `${key}=`
      }

      data += '&'
    }
  }

  data = data.substr(0, data.length - 1)

  return data
}

const sign = (data, secretKey) => {
  let signature = HmacSHA256(data, secretKey)
  let signatureBase64 = Base64.stringify(signature)
  return signatureBase64
}

module.exports = ({ config }) => {
  let amazonPayApi = Router()

  amazonPayApi.get('/GetOrderReferenceDetails', (req, res) => {
    let accessKey = config.extensions.amazonPay.accessKey
    let secretKey = config.extensions.amazonPay.secretKey
    if (!accessKey || !secretKey) {
      apiStatus(res, 'No access key is available.', 500)
      return
    }

    let sellerId = config.extensions.amazonPay.sellerId
    if (!sellerId) {
      apiStatus(res, 'No seller id is available.', 500)
      return
    }

    let orderReferenceId = req.query.orderReferenceId
    if (!orderReferenceId) {
      apiStatus(res, 'orderReferenceId is required', 500)
      return
    }

    let accessToken = decodeURIComponent(req.query.accessToken)
    if (!accessToken) {
      apiStatus(res, 'accessToken is required', 500)
      return
    }

    const apiVersion = '2013-01-01'
    const method = 'POST'
    let t = new Date()
    let timestamp = t.toISOString()
    let url = new URL(`${config.extensions.amazonPay.endpoint}/OffAmazonPayments${config.extensions.amazonPay.sandbox ? '_Sandbox' : ''}/${apiVersion}`)
    let parameters = {
      'AWSAccessKeyId': accessKey,
      'Action': 'GetOrderReferenceDetails',
      'AccessToken': accessToken,
      'AmazonOrderReferenceId': orderReferenceId,
      'SellerId': sellerId,
      'SignatureMethod': ALGORITHM,
      'SignatureVersion': '2',
      'Timestamp': timestamp,
      'Version': apiVersion
    }
    let formattedParameters = calculateStringToSignV2(parameters, method, url)
    let signature = sign(formattedParameters, secretKey)
    parameters['Signature'] = signature

    let request = require('request')
    request({
      url,
      method,
      form: parameters
    }, (error, response, xml) => {
      if (error) {
        apiStatus(res, error, 500)
      } else {
        parseString(xml, {trim: true, explicitArray: false}, (err, result) => {
          if (err) {
            apiStatus(res, err, 500)
          } else {
            if (result.ErrorResponse) {
              apiStatus(res, { errors: result.ErrorResponse.Error }, 500)
            } else {
              apiStatus(res, result.GetOrderReferenceDetailsResponse.GetOrderReferenceDetailsResult.OrderReferenceDetails, 200)
            }
          }
        })
      }
    })
  })

  amazonPayApi.post('/SetOrderReferenceDetails', (req, res) => {
    let accessKey = config.extensions.amazonPay.accessKey
    let secretKey = config.extensions.amazonPay.secretKey
    if (!accessKey || !secretKey) {
      apiStatus(res, 'No access key is available.', 500)
      return
    }

    let sellerId = config.extensions.amazonPay.sellerId
    if (!sellerId) {
      apiStatus(res, 'No seller id is available.', 500)
      return
    }

    let orderReferenceId = req.query.orderReferenceId
    if (!orderReferenceId) {
      apiStatus(res, 'orderReferenceId is required', 500)
      return
    }

    let orderReferenceAttributes = req.body.orderReferenceAttributes
    if (!orderReferenceAttributes) {
      apiStatus(res, 'orderReferenceAttributes is required', 500)
      return
    }

    orderReferenceAttributes = CollapseLib.collapseDict({ OrderReferenceAttributes: orderReferenceAttributes })

    const apiVersion = '2013-01-01'
    const method = 'POST'
    let t = new Date()
    let timestamp = t.toISOString()
    let url = new URL(`${config.extensions.amazonPay.endpoint}/OffAmazonPayments${config.extensions.amazonPay.sandbox ? '_Sandbox' : ''}/${apiVersion}`)
    let parameters = {
      'AWSAccessKeyId': accessKey,
      'Action': 'SetOrderReferenceDetails',
      'AmazonOrderReferenceId': orderReferenceId,
      ...orderReferenceAttributes,
      'SellerId': sellerId,
      'SignatureMethod': ALGORITHM,
      'SignatureVersion': '2',
      'Timestamp': timestamp,
      'Version': apiVersion
    }

    let formattedParameters = calculateStringToSignV2(parameters, method, url)
    let signature = sign(formattedParameters, secretKey)
    parameters['Signature'] = signature

    let request = require('request')
    request({
      url,
      method,
      form: parameters
    }, (error, response, xml) => {
      if (error) {
        apiStatus(res, error, 500)
      } else {
        parseString(xml, {trim: true, explicitArray: false}, (err, result) => {
          if (err) {
            apiStatus(res, err, 500)
          } else {
            if (result.ErrorResponse) {
              apiStatus(res, { errors: result.ErrorResponse.Error }, 500)
            } else {
              apiStatus(res, result.SetOrderReferenceDetailsResponse.SetOrderReferenceDetailsResult.OrderReferenceDetails, 200)
            }
          }
        })
      }
    })
  })

  amazonPayApi.post('/ConfirmOrderReference', (req, res) => {
    let accessKey = config.extensions.amazonPay.accessKey
    let secretKey = config.extensions.amazonPay.secretKey
    if (!accessKey || !secretKey) {
      apiStatus(res, 'No access key is available.', 500)
      return
    }

    let sellerId = config.extensions.amazonPay.sellerId
    if (!sellerId) {
      apiStatus(res, 'No seller id is available.', 500)
      return
    }

    let orderReferenceId = req.query.orderReferenceId
    if (!orderReferenceId) {
      apiStatus(res, 'orderReferenceId is required', 500)
      return
    }

    const apiVersion = '2013-01-01'
    const method = 'POST'
    let t = new Date()
    let timestamp = t.toISOString()
    let url = new URL(`${config.extensions.amazonPay.endpoint}/OffAmazonPayments${config.extensions.amazonPay.sandbox ? '_Sandbox' : ''}/${apiVersion}`)
    let parameters = {
      'AWSAccessKeyId': accessKey,
      'Action': 'ConfirmOrderReference',
      'AmazonOrderReferenceId': orderReferenceId,
      'SellerId': sellerId,
      'SignatureMethod': ALGORITHM,
      'SignatureVersion': '2',
      'Timestamp': timestamp,
      'Version': apiVersion
    }

    let formattedParameters = calculateStringToSignV2(parameters, method, url)
    let signature = sign(formattedParameters, secretKey)
    parameters['Signature'] = signature

    let request = require('request')
    request({
      url,
      method,
      form: parameters
    }, (error, response, xml) => {
      if (error) {
        apiStatus(res, error, 500)
      } else {
        parseString(xml, {trim: true, explicitArray: false}, (err, result) => {
          if (err) {
            apiStatus(res, err, 500)
          } else {
            if (result.ErrorResponse) {
              apiStatus(res, { errors: result.ErrorResponse.Error }, 500)
            } else {
              apiStatus(res, result.ConfirmOrderReferenceResponse, 200)
            }
          }
        })
      }
    })
  })

  amazonPayApi.post('/Authorize', (req, res) => {
    let accessKey = config.extensions.amazonPay.accessKey
    let secretKey = config.extensions.amazonPay.secretKey
    if (!accessKey || !secretKey) {
      apiStatus(res, 'No access key is available.', 500)
      return
    }

    let sellerId = config.extensions.amazonPay.sellerId
    if (!sellerId) {
      apiStatus(res, 'No seller id is available.', 500)
      return
    }

    let orderReferenceId = req.query.orderReferenceId
    if (!orderReferenceId) {
      apiStatus(res, 'orderReferenceId is required', 500)
      return
    }

    let AuthorizationAmount = req.body.AuthorizationAmount
    if (!AuthorizationAmount) {
      apiStatus(res, 'AuthorizationAmount is required', 500)
      return
    }

    AuthorizationAmount = CollapseLib.collapseDict({ AuthorizationAmount: AuthorizationAmount })

    const apiVersion = '2013-01-01'
    const method = 'POST'
    let t = new Date()
    let timestamp = t.toISOString()
    let url = new URL(`${config.extensions.amazonPay.endpoint}/OffAmazonPayments${config.extensions.amazonPay.sandbox ? '_Sandbox' : ''}/${apiVersion}`)
    let parameters = {
      'AWSAccessKeyId': accessKey,
      'Action': 'Authorize',
      'AmazonOrderReferenceId': orderReferenceId,
      ...AuthorizationAmount,
      'AuthorizationReferenceId': uuidv1().substr(0, 32),
      'SellerId': sellerId,
      'SignatureMethod': ALGORITHM,
      'SignatureVersion': '2',
      'Timestamp': timestamp,
      'TransactionTimeout': 0,
      'Version': apiVersion
    }

    let formattedParameters = calculateStringToSignV2(parameters, method, url)
    let signature = sign(formattedParameters, secretKey)
    parameters['Signature'] = signature

    let request = require('request')
    request({
      url,
      method,
      form: parameters
    }, (error, response, xml) => {
      if (error) {
        apiStatus(res, error, 500)
      } else {
        parseString(xml, {trim: true, explicitArray: false}, (err, result) => {
          if (err) {
            apiStatus(res, err, 500)
          } else {
            if (result.ErrorResponse) {
              apiStatus(res, { errors: result.ErrorResponse.Error }, 500)
            } else {
              apiStatus(res, result.AuthorizeResponse.AuthorizeResult.AuthorizationDetails, 200)
            }
          }
        })
      }
    })
  })

  amazonPayApi.post('/CancelOrderReference', (req, res) => {
    let accessKey = config.extensions.amazonPay.accessKey
    let secretKey = config.extensions.amazonPay.secretKey
    if (!accessKey || !secretKey) {
      apiStatus(res, 'No access key is available.', 500)
      return
    }

    let sellerId = config.extensions.amazonPay.sellerId
    if (!sellerId) {
      apiStatus(res, 'No seller id is available.', 500)
      return
    }

    let orderReferenceId = req.query.orderReferenceId
    if (!orderReferenceId) {
      apiStatus(res, 'orderReferenceId is required', 500)
      return
    }

    const apiVersion = '2013-01-01'
    const method = 'POST'
    let t = new Date()
    let timestamp = t.toISOString()
    let url = new URL(`${config.extensions.amazonPay.endpoint}/OffAmazonPayments${config.extensions.amazonPay.sandbox ? '_Sandbox' : ''}/${apiVersion}`)
    let parameters = {
      'AWSAccessKeyId': accessKey,
      'Action': 'CancelOrderReference',
      'AmazonOrderReferenceId': orderReferenceId,
      'SellerId': sellerId,
      'SignatureMethod': ALGORITHM,
      'SignatureVersion': '2',
      'Timestamp': timestamp,
      'Version': apiVersion
    }

    let formattedParameters = calculateStringToSignV2(parameters, method, url)
    let signature = sign(formattedParameters, secretKey)
    parameters['Signature'] = signature

    let request = require('request')
    request({
      url,
      method,
      form: parameters
    }, (error, response, xml) => {
      if (error) {
        apiStatus(res, error, 500)
      } else {
        parseString(xml, {trim: true, explicitArray: false}, (err, result) => {
          if (err) {
            apiStatus(res, err, 500)
          } else {
            if (result.ErrorResponse) {
              apiStatus(res, { errors: result.ErrorResponse.Error }, 500)
            } else {
              apiStatus(res, result.CancelOrderReferenceResponse, 200)
            }
          }
        })
      }
    })
  })

  return amazonPayApi
}
