<template>
    <div class="field">
        <label>{{ $t('settings.form.interface.label__explorer-pattern') }}</label>
        <span class="description">
            {{ $t('settings.form.interface.description__explorer-pattern') }}
        </span>
        <div class="control">
            <input
                v-model="currentValue"
                v-validate="'required|url'"
                v-tooltip="getValidationTooltip('currentValue')"
                :data-vv-as="$t('settings.form.interface.label__explorer-pattern')"
                :placeholder="$t('settings.form.interface.placeholder__explorer-pattern')"
                name="currentValue"
                type="text"
            >
        </div>
    </div>
</template>

<script>
import ValidatedVuexModel from '@/mixins/ValidatedVuexModel'

import { addVuexModel } from '@/utils/store'
import types from '~/types'

export default {
    name: 'BlockchainExplorerSettings',

    mixins: [
        ValidatedVuexModel
    ],

    computed: {
        ...addVuexModel({
            name: 'storeValue',
            getter: 'Settings/getExplorerBaseUrl',
            action: types.settings.SET_BLOCKCHAIN_EXPLORER_BASE_URL
        })
    }
}
</script>

<style lang="scss" scoped>
    input {
        @include white-input();
    }
</style>
