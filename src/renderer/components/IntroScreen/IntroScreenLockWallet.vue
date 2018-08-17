<template>
    <div>
        <h1>Secure your funds!</h1>

        <p>Vestibulum id ligula porta felis euismod semper. Donec ullamcorper nulla non metus auctor fringilla.</p>

        <input type="text" />

        <footer>
            <BaseButton
                    color="green"
                    is-popover
                    @click="onNext"
            >Let's go!</BaseButton>
        </footer>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import GuideStepMixin from '@/mixins/GuideStepMixin'

    export default {
        name: 'IntroScreenLockWallet',
        mixins: [
            GuideStepMixin
        ],
        computed: {
            ...mapGetters({
                isLocked: 'App/isLocked'
            })
        },
        methods: {
            isEnabled () {
                return !this.isLocked
            }
        }
    }
</script>

<style scoped>

</style>