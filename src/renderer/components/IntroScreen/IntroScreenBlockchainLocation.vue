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

    const { dialog } = require('electron').remote

    export default {
        name: 'IntroScreenBlockchainLocation',
        mixins: [
            GuideStepMixin
        ],
        data () {
            return {
                bclocation: ''
            }
        },

        computed: {
            location () {
                return this.bclocation || this.$store.state.Settings.blockchainLocation
            }
        },

        methods: {
            selectFolder () {
                const path = dialog.showOpenDialog({
                    title: 'Select Blockchain Location',
                    // message: 'just a message',
                    properties: ['openDirectory']
                })

                if (!path) {
                    console.log('user canceled the selection in the dialog box')
                    return
                }

                console.log(path)
                this.bclocation = path
                this.onNext()
            },

            isEnabled () {
                return !this.location
            }
        }
    }
</script>

<style scoped>

</style>
