<template>
  <div :id="id" />
</template>

<script>
import config from 'config'

export default {
  name: 'AmazonPayWallet',
  props: {
    designMode: {
      type: String,
      required: false,
      default: 'responsive',
      validator: function (value) {
        return ['responsive', 'smartphoneCollapsible'].indexOf(value) !== -1
      }
    }
  },
  data () {
    return {
      id: 'amazon-pay-wallet'
    }
  },
  mounted () {
    if (config.amazonPay) {
      if (this.$store.state['amazon-pay'].amazonPaymentsReady) {
        this.setupWidget()
      } else {
        this.$bus.$on('amazon-payments-ready', () => {
          this.setupWidget()
        })
      }
    }
  },
  methods: {
    setupWidget () {
      new window.OffAmazonPayments.Widgets.Wallet({
        sellerId: config.amazonPay.merchantId,
        design: {
          designMode: this.designMode
        },
        amazonOrderReferenceId: this.$store.state['amazon-pay'].orderReferenceId,
        onPaymentSelect: this.onPaymentSelect,
        onReady: this.onReady,
        onError: this.onError
      }).bind(this.id)
    },
    onPaymentSelect (orderReference) {
      console.log(arguments)
      // Replace this code with the action that you want to perform
      // after the payment method is chosen.

      // Ideally this would enable the next action for the buyer
      // including either a "Continue" or "Place Order" button.
    },
    onReady (orderReference) {
      console.log(orderReference.getAmazonOrderReferenceId())
    },
    onError (error) {
      console.error(error.getErrorCode(), error.getErrorMessage())
    }
  }
}
</script>

<style scoped>
#amazon-pay-wallet {
  min-width: 300px;
  max-width: 600px;
  min-height: 228px;
  max-height: 400px;
}

/* Mobile optimized and small window */
#amazon-pay-wallet {
  width: 100%;
  height: 228px;
}

/* Desktop and tablet */
@media only screen and (min-width: 768px) {
  #amazon-pay-wallet {
    width: 400px;
    height: 228px;
  }
}
</style>
