<template>
    <div>
        <h1>Secure your funds!</h1>

        <p>Vestibulum id ligula porta felis euismod semper. Donec ullamcorper nulla non metus auctor fringilla.</p>

        <div class="form">
            <div class="control">
                <input type="text" placeholder="Enter Passphrase" />
            </div>
        </div>

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

<style lang="scss" scoped>
    .form .control input {
        // @include green-input();
    }
</style>