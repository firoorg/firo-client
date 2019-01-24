<template>
    <div>
        <h1 v-html="$t('onboarding.intro-screen.title')" />

        <p v-html="$t('onboarding.intro-screen.description')" />

        <footer>
            <BaseButton
                color="green"
                @click="foo"
            >
                {{ $t('onboarding.intro-screen.button__start--primary') }}
            </BaseButton>
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
            return true
        },

        foo () {
            this.$log.info('testing the logger')
            //console.log(this)
        }
    }
}
</script>

<style lang="scss" scoped>
</style>
