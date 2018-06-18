<template>
    <div>
        <h1>Select Blockchain Location</h1>

        <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Vestibulum id ligula porta felis euismod semper. Sed posuere consectetur est at lobortis.</p>

        <footer>
            <BaseButton
                    v-if="!location"
                    color="green"
                    is-popover
                    @click="selectFolder"
            >Select Location</BaseButton>
            <BaseButton
                    v-else
                    color="green"
                    is-popover
                    @click="onNext"
            >Done</BaseButton>
        </footer>
    </div>
</template>

<script>
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
            location () {
                return this.$store.state.Settings.blockchainLocation
            }
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
                this.onNext()
            },

            isEnabled () {
                return !this.location || !fs.existsSync(this.location)
            }
        }
    }
</script>

<style scoped>

</style>
