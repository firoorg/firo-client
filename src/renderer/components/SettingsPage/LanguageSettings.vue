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
            />
        </div>
    </div>
</template>

<script>
import { VueSelect } from 'vue-select'

export default {
    name: 'LanguageSettings',

    components: {
        VueSelect
    },

    computed: {
        currentLocale () {
            return {
                value: 'en',
                label: '🇬🇧 English'
            }
        },

        availableLocales () {
            return [
                {
                    value: 'en',
                    label: '🇬🇧 English'
                },
                {
                    value: 'de',
                    label: '🇩🇪 Deutsch'
                }
            ]
        }
    }
}
</script>

<style lang="scss" scoped>
    .select {
        @include white-select();
    }
</style>
