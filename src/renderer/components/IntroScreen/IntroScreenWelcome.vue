<template>
    <div>
        <h1 v-html="$t('onboarding.intro-screen.title')"></h1>

        <p v-html="$t('onboarding.intro-screen.description')"></p>

        <footer>
            <BaseButton
                    color="green"
                    @click="actions.next"
            >{{ $t('onboarding.intro-screen.button__start--primary') }}</BaseButton>
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
                return true
            }
        }
    }
</script>

<style lang="scss" scoped>
</style>
