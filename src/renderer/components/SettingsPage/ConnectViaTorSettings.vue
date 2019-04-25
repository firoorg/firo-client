<template>
    <div class="field">
        <label>
            {{ $t('settings.form.privacy.label__connect-via-tor') }}
        </label>
        <span class="description">
            {{ $t('settings.form.privacy.description__connect-via-tor') }}
        </span>
        <div
            class="control"
            :class="{ 'is-disabled': disabled }"
        >
            <base-checkbox
                v-model="connectedViaTor"
                :disabled="disabled"
                size="large"
                color="green"
            >
                <template slot-scope="{ isChecked, isDisabled }">
                    <i18n
                        v-if="isDisabled"
                        path="settings.form.privacy.label__connect-via-tor--disabled"
                        tag="span"
                    >
                        <em place="configFile">
                            zcoin.conf
                        </em>
                        <code place="value">{{ name }}={{ getDaemonSettingValue(name) }}</code>
                    </i18n>
                    <span v-else>
                        {{ $t(`settings.form.privacy.label__connect-via-tor--${isChecked ? 'checked' : 'unchecked'}`) }}
                    </span>
                </template>
            </base-checkbox>
        </div>
    </div>
</template>

<script>
import types from '~/types'
import { mapGetters } from 'vuex'
import { addVuexModel } from '@/utils/store'

export default {
    name: 'ConnectViaTorSettings',

    data () {
        return {
            name: 'torsetup',
            torCheckbox: this.connectedViaTor
        }
    },

    computed: {
        ...mapGetters({
            getDaemonSettingValue: 'Settings/getDaemonSettingValue',
            getDaemonSettingHasChanged: 'Settings/getDaemonSettingHasChanged',
            getDaemonSettingIsDisabled: 'Settings/getDaemonSettingIsDisabled'
        }),

        ...addVuexModel({
            name: 'connectedViaTor',
            getter: 'Settings/torsetup',
            action: types.settings.SET_TORSETUP
        }),

        connectedViaTor: {
            get () {
                return this.$store.getters['Settings/torsetup']
            },
            set (val) {
                this.$store.dispatch(types.settings.SET_TORSETUP, val)
                this.$emit('toggle-tor')
            }
        },

        hasChanged () {
            return this.getDaemonSettingHasChanged(this.name)
        },

        disabled () {
            return this.getDaemonSettingIsDisabled(this.name)
        }
    }
}
</script>

<style lang="scss" scoped>
.control {
    max-width: 30rem;
    margin-top: emRhythm(1);

    &.is-disabled {
        color: $color--comet;
    }
}

code {
    display: inline-block;
    background: $color--polo-medium;
    //color: $color--white;
    color: mix($color--comet-dark, $color--comet);
    padding: 0 emRhythm(0.5, $silent: true);
    border-radius: 0.125rem;
}

em {
    color: mix($color--comet-dark, $color--comet);
}
</style>
