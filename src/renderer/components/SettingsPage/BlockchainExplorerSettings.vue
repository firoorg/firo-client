<template>
    <div class="field">
        <label>{{ $t('settings.form.interface.label__explorer-pattern') }}</label>
        <span class="description">
            {{ $t('settings.form.interface.description__explorer-pattern') }}
        </span>
        <div class="control">
            <input
                v-model="explorerUrl"
                v-validate="'required|url'"
                v-tooltip="getValidationTooltip('explorerUrl')"
                :placeholder="$t('settings.form.interface.placeholder__explorer-pattern')"
                name="explorerUrl"
                type="text"
            >
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

import ValidationMixin from '@/mixins/ValidationMixin'
import { addVuexModel } from '@/utils/store'
import types from '~/types'

export default {
    name: 'BlockchainExplorerSettings',

    mixins: [
        ValidationMixin
    ],
    $_veeValidate: {
        validator: 'new' // give me my own validator instance.
    },

    data () {
        return {
            explorerUrl: '',
            validationFieldOrder: [
                'explorerUrl'
            ]
        }
    },

    computed: {
        /*
        ...addVuexModel({
            name: 'explorerUrl',
            getter: 'Settings/getExplorerBaseUrl',
            isValidAction: types.settings.SET_BLOCKCHAIN_EXPLORER_BASE_URL,
            action: types.settings.SET_BLOCKCHAIN_EXPLORER_BASE_URL
        })
        */
    },

    watch: {
        validationErrors: {
            deep: true,
            handler: function (errorsNew) {
                console.log('errors watch', errorsNew);
                if (!errorsNew.items.length) {
                    console.log('sett')
                }
            }
        }
    },

    mounted() {
        this.explorerUrl = this.$store.getters['Settings/getExplorerBaseUrl']
    }
}
</script>

<style lang="scss" scoped>
    input {
        @include white-input();
    }
</style>
