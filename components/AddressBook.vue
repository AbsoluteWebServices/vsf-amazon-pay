<template>
  <div :id="id" />
</template>

<script>
import config from 'config'

export default {
  name: 'AmazonPayAddressBook',
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
      id: 'amazon-pay-address-book'
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
      new window.OffAmazonPayments.Widgets.AddressBook({
        sellerId: config.amazonPay.merchantId,
        design: {
          designMode: this.designMode
        },
        onOrderReferenceCreate: this.onOrderReferenceCreate,
        onAddressSelect: this.onAddressSelect,
        onReady: this.onReady,
        onError: this.onError
      }).bind(this.id)
    },
    onOrderReferenceCreate (orderReference) {
      console.log(orderReference.getAmazonOrderReferenceId())
      this.$store.commit('amazon-pay/SET_ORDER_REFERENCE_ID', orderReference.getAmazonOrderReferenceId())
    },
    onAddressSelect (orderReference) {
      console.log(arguments)
      // Replace the following code with the action that you want
      // to perform after the address is selected. The
      // amazonOrderReferenceId can be used to retrieve the address
      // details by calling the GetOrderReferenceDetails operation.

      // If rendering the AddressBook and Wallet widgets
      // on the same page, you do not have to provide any additional
      // logic to load the Wallet widget after the AddressBook widget.

      // The Wallet widget will re-render itself on all subsequent
      // onAddressSelect events without any action from you.
      // We don't recommend that you explicitly refresh it.
    },
    onReady (orderReference) {
      // Enter code here that you want to be executed
      // when the address widget has been rendered.
    },
    onError (error) {
      console.error(error.getErrorCode(), error.getErrorMessage())
    }
  }
}
</script>

<style scoped>
#amazon-pay-address-book {
  min-width: 300px;
  max-width: 600px;
  min-height: 228px;
  max-height: 400px;
}

/* Mobile optimized and small window */
#amazon-pay-address-book {
  width: 100%;
  height: 228px;
}

/* Desktop and tablet */
@media only screen and (min-width: 768px) {
  #amazon-pay-address-book {
    width: 400px;
    height: 228px;
  }
}
</style>
