<template>
    <div>
        <h1>Welcome!</h1>

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
    import GuideStepMixin from '@/mixins/GuideStepMixin'
    export default {
        name: 'IntroScreenWelcome',
        mixins: [
            GuideStepMixin
        ],
        methods: {
            isEnabled () {
                console.log('App/showIntroScreen', this.$store.getters['App/showIntroScreen'])
                return false
            }
        }
    }
</script>

<style lang="scss" scoped>
</style>