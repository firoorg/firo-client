<template>
    <div>
        <h1 v-html="$t('onboarding.intro-screen.title')" />

        <p v-html="$t('onboarding.intro-screen.description')" />

        <footer>
            <BaseButton
                color="green"
                @click="next"
            >
                {{ $t('onboarding.intro-screen.button__start--primary') }}
            </BaseButton>
        </footer>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import GuideStepMixin from '@/mixins/GuideStepMixin'

export default {
    name: 'IntroScreenWelcome',
    mixins: [
        GuideStepMixin
    ],

    computed: {
        ...mapGetters({
            isInitialRun: 'App/isInitialRun'
        })
    },

    methods: {
        isEnabled () {
            return this.isInitialRun
        },
        next() {
            this.actions.next();
        }
    }
}
</script>

<style lang="scss" scoped>
</style>
