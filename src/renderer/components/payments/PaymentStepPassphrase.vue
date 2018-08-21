<template>
    <div class="form">
        <h2>Unlock Client</h2>
        <p>Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p>

        <div class="control">
            <input type="text" v-model="passphrase" placeholder="Enter your Passphrase" ref="input" />
        </div>
    </div>
</template>

<script>
    import { addVuexModel } from '@/utils/store'
    import types from '~/types'

    export default {
        name: 'PaymentStepPassphrase',

        props: {
            action: {
                type: String,
                required: true
            },

            getter: {
                type: String,
                required: true
            }
        },

        mounted () {
            this.$refs.input.focus()
        },

        computed: {
            ...addVuexModel({
                name: 'passphrase',
                action: types.zcoinpayment.SET_CURRENT_PASSPHRASE,
                getter: 'ZcoinPayment/currentPassphrase'
            })
        }
    }
</script>

<style lang="scss" scoped>
    @include h2-with-description();

    .control {
        margin-top: emRhythm(5);

        input {
            @include dark-input();
        }
    }
</style>