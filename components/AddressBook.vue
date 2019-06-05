<template>
  <div :id="id" :class="{loaded}" />
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
      id: 'amazon-pay-address-book',
      loaded: false
    }
  },
  mounted () {
    // TODO: if no token saved - render button component instead
    if (config.amazonPay) {
      if (this.$store.state['amazon-pay'].amazonPaymentsReady && this.$store.state['amazon-pay'].userToken) {
        this.setupWidget()
      } else {
        this.$bus.$on('amazon-authorized', this.setupWidget)
      }
    }
  },
  methods: {
    setupWidget () {
      this.loaded = false
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
      this.$store.commit('amazon-pay/SET_ORDER_REFERENCE_ID', orderReference.getAmazonOrderReferenceId())
      this.$bus.$emit('amazon-order-reference-created', orderReference.getAmazonOrderReferenceId())
    },
    onAddressSelect () {
      this.$bus.$emit('amazon-address-selected')
      this.$store.dispatch('amazon-pay/getOrderReferenceDetails').then(response => {
        this.$bus.$emit('amazon-address-available', response.result.Destination)
      })
    },
    onReady (orderReference) {
      this.loaded = true
      this.$bus.$emit('amazon-address-book-ready', orderReference)
    },
    onError (error) {
      console.error(error.getErrorCode(), error.getErrorMessage())
    }
  }
}
</script>

<style scoped>
#amazon-pay-address-book.loaded {
  min-width: 300px;
  max-width: 600px;
  min-height: 228px;
  max-height: 400px;
}

/* Mobile optimized and small window */
#amazon-pay-address-book.loaded {
  width: 100%;
  height: 228px;
}

/* Desktop and tablet */
@media only screen and (min-width: 768px) {
  #amazon-pay-address-book.loaded {
    width: 400px;
    height: 228px;
  }
}
</style>
