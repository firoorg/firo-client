<template>
    <div>
        <h1>Welcome!</h1>

        <p>Thank you for downloading the Zcoin Client! You have taken the first step towards financial privacy. Click Next to begin setting up your client</p>

        <footer>
            <BaseButton
                    color="green"
                    @click="actions.next"
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
                return true
            }
        }
    }
</script>

<style lang="scss" scoped>
</style>
