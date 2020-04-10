<template>
    <div>
        <h1 v-html="$t('onboarding.set-blockchain-location.title')" />

        <p v-html="$t('onboarding.set-blockchain-location.description')" />

        <div v-if="!hasSelectedFolder">
            <BaseButton
                :is-outline="true"
                @click.once="startDaemon"
            >
                {{ $t('onboarding.set-blockchain-location.button__use-default-location--secondary') }}
            </BaseButton>

            <BaseButton
                color="green"
                @click="selectFolder"
            >
                {{ $t('onboarding.set-blockchain-location.button__select-folder--primary') }}
            </BaseButton>
        </div>

        <BaseButton
            v-else
            color="green"
            @click.once="startDaemon"
        >
            {{ $t('onboarding.set-blockchain-location.button__confirm-selection--primary') }}
        </BaseButton>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import GuideStepMixin from '@/mixins/GuideStepMixin'

import zcoind from "#/daemon/init";
import store from "#/store/renderer";

const { dialog } = require('electron').remote

export default {
    name: 'IntroScreenBlockchainLocation',

    mixins: [
        GuideStepMixin
    ],

    data: () => ({
        blockchainLocation: ''
    }),

    computed: {
        ...mapGetters({
            zcoindLocation: 'App/zcoindLocation'
        }),

        hasSelectedFolder() {
            return !!this.blockchainLocation;
        }
    },

    methods: {
        async selectFolder () {
            const [blockchainLocation] = dialog.showOpenDialog({
                title: 'Select Zcoin Blockchain Location',
                properties: [
                    'openDirectory',
                    'createDirectory',
                    'promptToCreate',
                    'showHiddenFiles'
                ],
                buttonLabel: this.$t('onboarding.set-blockchain-location.button__select-location--primary')
            });

            this.blockchainLocation = blockchainLocation;
        },

        async startDaemon () {
            if (this.blockchainLocation) {
                try {
                    // Commit the blockchain location to our preferences file. It MAY be the empty string.
                    await this.$store.dispatch('App/changeBlockchainLocation', this.blockchainLocation);
                } catch (e) {
                    // FIXME: Allow the user to reselect the location if the one they pick first is invalid.
                    alert(`Blockchain location is invalid: ${e}`);
                    app.exit(-1);
                }
            }

            try {
                const zcoind = zcoind(store, this.zcoindLocation, this.blockchainLocation || null);
                zcoind.start();

                Vue.prototype.$daemon = zcoind;
            } catch(e) {
                alert(`Couldn't start zcoind: ${e}`);
                app.exit(-1);
            }

            this.$nextTick(() => {
                this.actions.next()
            })
        },

        isEnabled: () => true
    }
}
</script>

<style scoped>

</style>
