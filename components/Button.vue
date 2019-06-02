<template>
  <div :id="id" />
</template>

<script>
import config from 'config'

export default {
  name: 'AmazonPayButton',
  props: {
    type: {
      type: String,
      required: true,
      validator: function (value) {
        return ['LwA', 'PwA'].indexOf(value) !== -1
      }
    },
    color: {
      type: String,
      required: false,
      default: 'Gold',
      validator: function (value) {
        return ['Gold', 'LightGray', 'DarkGray'].indexOf(value) !== -1
      }
    },
    size: {
      type: String,
      required: false,
      default: 'medium',
      validator: function (value) {
        return ['small', 'medium', 'large', 'x-large'].indexOf(value) !== -1
      }
    },
    popup: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data () {
    return {
      id: 'amazon-pay-button'
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
      window.OffAmazonPayments.Button(this.id, config.amazonPay.merchantId, {
        type: this.type,
        color: this.color,
        size: this.size,
        authorization: this.authorization,
        onError: this.onError
      })
    },
    onError (error) {
      console.error(error.getErrorCode(), error.getErrorMessage())
    },
    authorization () {
      window.amazon.Login.authorize({
        scope: this.type === 'LwA' ? 'profile' : 'profile payments:widget payments:shipping_address',
        popup: this.popup
      }, function (res) {
        console.log('access_token', res.access_token)
        console.log('expires_in', res.expires_in)
        console.log('token_type', res.token_type)
        // showAddressBookWidget();

        this.$store.dispatch('amazon-pay/login', res.access_token)
      })
    }
  }
}
</script>
