<template>
    <div class="form">
        <header>
            <h2 v-html="$t('mint.flyout-unlock-client.title')" />
            <p v-html="$t('mint.flyout-unlock-client.description')" />
        </header>
        <div
            class="field"
            :class="getFieldErrorClass('passphrase')"
        >
            <label for="passphrase">
                {{ $t('mint.flyout-unlock-client.label__passphrase') }}
            </label>
            <div class="control">
                <input
                    id="passphrase"
                    ref="input"
                    v-model="passphrase"
                    v-validate="{ required: true }"
                    type="password"
                    :placeholder="$t('mint.flyout-unlock-client.placeholder__passphrase')"
                    name="passphrase"
                >
            </div>
        </div>
    </div>
</template>

<script>
import { addVuexModel } from '@/utils/store'
import types from '~/types'
import ValidationMixin from '@/mixins/ValidationMixin'

export default {
    name: 'PaymentStepPassphrase',

    mixins: [
        ValidationMixin
    ],

    $_veeValidate: {
        validator: 'new' // give me my own validator instance.
    },

    beforeCreate () {
        this.$parent.$emit('can-submit', false)
    },

    mounted () {
        this.$refs.input.focus()
    },

    computed: {
        ...addVuexModel({
            name: 'passphrase',
            action: types.app.SET_CURRENT_PASSPHRASE,
            getter: 'App/currentPassphrase'
        }),

        canSubmit () {
            try {
                return !!this.validationFields.passphrase.valid
            } catch (e) {
                return false
            }
        }
    },

    watch: {
        canSubmit: {
            handler (newVal) {
                console.log('emitting passphrase state', newVal)
                this.$parent.$emit('can-submit', newVal)
            },
            immediate: true
        }
    }
}
</script>

<style lang="scss" scoped>
    @include h2-with-description();

    .field {
        margin-top: emRhythm(5);
    }
</style>
