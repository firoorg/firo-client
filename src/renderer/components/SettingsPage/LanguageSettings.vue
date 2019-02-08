<template>
    <div class="field">
        <label>{{ $t('settings.form.interface.label__language') }}</label>
        <span class="description">
            {{ $t('settings.form.interface.description__language') }}
        </span>
        <div class="control">
            <vue-select
                class="select test"
                :options="availableLocales"
                :value="currentLocale"
                :placeholder="placeholder"
                @input="onChange"
            />
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { VueSelect } from 'vue-select'
import types from '~/types'

export default {
    name: 'LanguageSettings',

    components: {
        VueSelect
    },

    computed: {
        ...mapGetters({
            currentLocale: 'Settings/currentLocale',
            currentLocaleKey: 'Settings/currentLocaleKey',
            availableLocales: 'Settings/availableLocales'
        }),

        placeholder () {
            return this.currentLocale ? this.currentLocale.label : ''
        }
    },

    methods: {
        ...mapActions({
            setLocale: types.settings.SET_LOCALE
        }),

        onChange (selected) {
            if (!selected) {
                return
            }

            this.setLocale(selected.key)
        }
    }
}
</script>

<style lang="scss" scoped>
    .select {
        @include white-select();
    }
</style>
