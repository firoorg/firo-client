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
                v-model="torCheckbox"
                size="large"
                color="green"
            >
                {{ $t('settings.form.privacy.label__connect-via-tor') }}
            </base-checkbox>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'ConnectViaTorSettings',

    computed: {
        ...mapGetters({
            isConnectedViaTor: 'Settings/isConnectedViaTor'
        }),

        torCheckbox: {
            get () {
                return this.isConnectedViaTor
            },
            async set (val) {
                await $daemon.updateSettings({torsetup: val ? '1' : '0'});
                this.$store.commit('Settings/setDaemonSettings', await $daemon.getSettings());
                this.$emit('toggle-tor')
            }
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
