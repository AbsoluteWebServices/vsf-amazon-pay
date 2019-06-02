export function afterRegistration({ Vue, config, store, isServer }) {
  if (config.amazonPay) {
    const CURRENT_METHOD_CODE = 'amazon-pay'
  
    // Update the methods
    store.dispatch('payment/addMethod', {
      'title': 'Amazon Pay',
      'code': CURRENT_METHOD_CODE,
      'cost': 0,
      'costInclTax': 0,
      'default': false,
      'offline': false,
      'is_server_method': false
    })

    if (!isServer) {
      let w = window as any

      w.onAmazonLoginReady = function() {
        w.amazon.Login.setClientId(config.amazonPay.clientId); 
      }
      w.onAmazonPaymentsReady = () => {
        store.commit('amazon-pay/SET_AMAZON_PAYMENTS_READY', true)
        Vue.prototype.$bus.$emit('amazon-payments-ready')
      }
      Vue.prototype.$bus.$on('user-before-logout', () => {
        w.amazon.Login.logout()
      })

      let jsUrl = `https://static-na.payments-amazon.com/OffAmazonPayments/us/${ config.amazonPay.sandbox ? 'sandbox/' : '' }js/Widgets.js`
      let docHead = document.getElementsByTagName('head')[0]
      let docScript = document.createElement('script')

      docScript.type = 'text/javascript'
      docScript.async = true
      docScript.src = jsUrl
      docHead.appendChild(docScript)

      let correctPaymentMethod = false

      Vue.prototype.$bus.$on('checkout-payment-method-changed', (paymentMethodCode) => {
        if (paymentMethodCode === CURRENT_METHOD_CODE) {
          correctPaymentMethod = true
        } else {
          correctPaymentMethod = false
        }
      })

      const placeOrder = () => {
        if (correctPaymentMethod) {
          Vue.prototype.$bus.$emit('checkout-do-placeOrder', {})
        }
      }

      Vue.prototype.$bus.$on('checkout-before-placeOrder', placeOrder)
    }
  }
}
