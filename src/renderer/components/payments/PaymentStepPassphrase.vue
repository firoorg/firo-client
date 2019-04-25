<template>
    <div class="form">
        <header>
            <h2 v-html="$t(`${translationNamespace}.title`)" />
            <p v-html="$t(`${translationNamespace}.description`)" />
        </header>
        <div
            class="field"
            :class="getFieldErrorClass('passphrase')"
        >
            <label for="passphrase">
                {{ $t(`${translationNamespace}.label__passphrase`) }}
            </label>
            <div class="control">
                <input
                    id="passphrase"
                    ref="input"
                    v-model="passphrase"
                    v-validate="{ required: true }"
                    v-focus
                    type="password"
                    :placeholder="$t(`${translationNamespace}.placeholder__passphrase`)"
                    name="passphrase"
                    @keyup.enter="onEnter"
                >
            </div>
        </div>
    </div>
</template>

<script>
import { addVuexModel } from '@/utils/store'
import types from '~/types'

import TranslationNamespaceMixin from '@/mixins/TranslationNamespaceMixin'
import ValidationMixin from '@/mixins/ValidationMixin'

export default {
    name: 'PaymentStepPassphrase',

    mixins: [
        ValidationMixin,
        TranslationNamespaceMixin
    ],

    $_veeValidate: {
        validator: 'new' // give me my own validator instance.
    },

    props: {
        onFormSubmit: {
            type: Function,
            required: true
        }
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
                this.$parent.$emit('can-submit', newVal)
            },
            immediate: true
        }
    },

    beforeCreate () {
        this.$parent.$emit('can-submit', false)
    },

    methods: {
        onEnter () {
            if (!this.canSubmit) {
                return
            }

            // This is picked up in PaymentStepPassphraseButtons. It was the only hack I could think of to cut through
            // the spaghetti. Please don't shoot me. :x
            this.$eventHub.$emit('advance-from-passphrase-step')
        }
    }
}
</script>

<style lang="scss" scoped>
    @include h2-with-description();

    .form .field {
        margin-top: emRhythm(5);
        margin-bottom: 0;
    }
</style>
