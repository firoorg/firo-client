<i18n>
    en:
        heading: "Zcoin Balance"
</i18n>

<template>
    <section
        class="balance"
        :class="{'is-confirmed': isConfirmed }"
    >
        <div class="label">
            {{ $t('navigation.balance.title') }}
            <span />
        </div>
        <!-- TODO animate change of current balance
        @inspiration https://josex2r.github.io/jQuery-SlotMachine/
        @inspiration http://preview.codecanyon.net/item/jcountdown-mega-package/full_screen_preview/3443480
        -->
        <span
            class="amount"
            @click="toggleBalance"
        >
            {{ this.balance }}
        </span>
    </section>
</template>

<script>
import { mapGetters } from 'vuex' /* , mapActions */
import { convertToCoin } from '#/lib/convert'
// import ConfirmationBadge from '@/components/Badge/ConfirmationBadge'

export default {
    name: 'Balance',
    components: {
        // ConfirmationBadge
    },

    data () {
        return {
            pendingConfirmations: 1,
            requiredConfirmations: 6,
            confirmationsInterval: null,
            showBalanceInCurrency: false,
            exchange: {
                factor: 50,
                unit: 'USD',
                decimals: 2
            }
        }
    },

    /*
      created () {
          this.confirmationsInterval = setInterval(() => {
              this.pendingConfirmations--

              if (this.pendingConfirmations < 0) {
                  this.pendingConfirmations = this.requiredConfirmations
              }
          }, 10000)
      },

      beforeDestroy () {
          clearInterval(this.confirmationsInterval)
      },
      */

    computed: {
        ...mapGetters({
            totalBalance: 'Balance/total'
        }),

        isConfirmed () {
            return this.pendingConfirmations === 0
        },

        balance () {
            const {factor, unit, decimals} = this.exchange

            return this.showBalanceInCurrency ? `${(this.totalBalance * factor).toFixed(decimals)} ${unit}` : `${convertToCoin(this.totalBalance)} XZC`
        }
    },

    watch: {
        isConfirmed (isConfirmed, wasConfimed) {
            if (!isConfirmed) {
                return
            }
            console.log('is confirmed')
            /*
              this.sendNotification({
                  title: 'Balance Confirmed',
                  message: 'Your balance is now fully confirmed 👍',
                  type: 'success'
              })
              */
        },
        pendingConfirmations (newPending, oldPending) {
            if (this.isConfirmed) {
                return
            }

            console.log(`Confirmations update ${this.requiredConfirmations - newPending}/${this.requiredConfirmations}. @todo`)

            /*
              this.showMessage({
                  message: `Confirmations update ${this.requiredConfirmations - newPending}/${this.requiredConfirmations}. @todo`
              })
              */
        }
    },

    methods: {
        /*
          ...mapActions({
              showMessage: 'Notification/showMessage',
              sendNotification: 'Notification/sendNotification'
          }),
          */

        toggleBalance () {
            this.showBalanceInCurrency = !this.showBalanceInCurrency
        }
    }
}
</script>

<style lang="scss" scoped>
    .label,
    .amount {
        display: block;
        @include setType(3);
    }

    .balance {
        margin-top: emRhythm(0.69, $silent: true);
    }

    .amount {
        margin-top: emRhythm(1);
        color: #23B852;
        opacity: .8;
        transition: all .15s ease-in-out;
        //text-shadow: 0 0 10px $color--green-bright;
        cursor: default;
    }

    .pending-confirmations {
        cursor: help;
        opacity: 1;
        transition: opacity .5s 3s ease-in-out;
    }

    .is-confirmed {
        .amount {
            opacity: 1;
            animation: animate--text-shadow-green-bright 1.5s infinite alternate;
        }

        .pending-confirmations {
            opacity: 0;
            transition-delay: 0;
        }
    }
</style>
