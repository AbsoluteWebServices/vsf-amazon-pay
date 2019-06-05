<template>
  <div :id="id" />
</template>

<script>
import config from 'config'
import i18n from '@vue-storefront/i18n'

const TYPE_LOGIN = 'LwA'
const TYPE_PAY = 'PwA'

// TODO: add login button functionality
export default {
  name: 'AmazonPayButton',
  props: {
    type: {
      type: String,
      required: true,
      validator: function (value) {
        return [TYPE_PAY].indexOf(value) !== -1
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
        this.$bus.$on('amazon-payments-ready', this.setupWidget)
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
        scope: this.type === TYPE_LOGIN ? 'profile' : 'profile payments:widget payments:shipping_address',
        popup: this.popup
      }, this.onAuthorize)
    },
    onAuthorize (response) {
      this.$bus.$emit('notification-progress-start', i18n.t('Authorization in progress ...'))
      let decodedAccessToken = decodeURIComponent(response.access_token)
      this.$store.commit('amazon-pay/SET_USER_TOKEN', decodedAccessToken)

      // this.$store.dispatch('amazon-pay/getLoginProfile', response.access_token).then(response => {
      this.$bus.$emit('amazon-authorized', response)
      switch (this.type) {
        case TYPE_LOGIN:
          // TODO: handle login
          this.$bus.$emit('notification-progress-stop')
          break

        case TYPE_PAY:
          this.$bus.$emit('notification-progress-stop')
          this.$router.push({ name: 'checkout' })
          break
      }
      // })
    }
  }
}
</script>
