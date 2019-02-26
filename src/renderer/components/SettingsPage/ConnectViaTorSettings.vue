<template>
    <div class="field">
        <label>
            {{ $t('settings.form.privacy.label__connect-via-tor') }}
        </label>
        <span class="description">
            {{ $t('settings.form.privacy.description__connect-via-tor') }}
        </span>
        <div class="control">
            <base-checkbox
                v-model="connectedViaTor"
                size="large"
                color="green"
            >
                <template slot-scope="{ isChecked }">
                    {{ $t(`settings.form.privacy.label__connect-via-tor--${isChecked ? 'enabled' : 'disabled'}`) }}
                </template>
            </base-checkbox>
        </div>
    </div>
</template>

<script>
import types from '~/types'

import { addVuexModel } from '@/utils/store'

export default {
    name: 'ConnectViaTorSettings',

    computed: {
        ...addVuexModel({
            name: 'connectedViaTor',
            getter: 'Settings/isConnectedViaTor',
            action: types.settings.SET_TORSETUP
        })
    }
}
</script>

<style lang="scss" scoped>
.control {
    max-width: 30rem;
    margin-top: emRhythm(1);
}
</style>
