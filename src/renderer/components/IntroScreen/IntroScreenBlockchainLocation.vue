<template>
    <div>
        <h1 v-html="$t('onboarding.set-blockchain-location.title')"></h1>

        <p v-html="$t('onboarding.set-blockchain-location.description')"></p>

        <footer>
            <BaseButton v-if="!hasLocation"
                        color="green"
                        @click="selectFolder"
            >{{ $t('onboarding.set-blockchain-location.button__select-folder--primary') }}</BaseButton>
            <BaseButton v-else
                        color="green"
                        @click="actions.next"
            >{{ $t('onboarding.set-blockchain-location.button__confirm-selection--primary') }}</BaseButton>
        </footer>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import GuideStepMixin from '@/mixins/GuideStepMixin'
    import path from 'path'
    import types from '~/types'

    import fs from 'fs'

    const { dialog } = require('electron').remote

    export default {
        name: 'IntroScreenBlockchainLocation',
        mixins: [
            GuideStepMixin
        ],

        computed: {
            ...mapGetters({
                hasLocation: 'Settings/hasBlockchainLocation',
                location: 'Settings/blockchainLocation'
            })
        },

        methods: {
            selectFolder () {
                const [ blockchainPath ] = dialog.showOpenDialog({
                    title: 'Select Zcoin Blockchain Location',
                    // message: 'just a message',
                    properties: ['openDirectory'],
                    // todo get default path
                    defaultPath: path.resolve('/Users/joernroeder/Library/Application Support/zcoin'),
                    buttonLabel: 'Select Location'
                })

                if (!blockchainPath) {
                    console.log('user canceled the selection in the dialog box')
                    return
                }

                console.log(types)
                this.$store.dispatch(types.settings.SET_BLOCKCHAIN_LOCATION, { location: blockchainPath })
                this.actions.next()
            },

            isEnabled () {
                return !this.hasLocation || !fs.existsSync(this.location)
            }
        }
    }
</script>

<style scoped>

</style>
