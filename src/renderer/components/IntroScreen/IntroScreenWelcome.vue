<template>
    <div>
        <h1>Welcome!</h1>

        <p>Maecenas sed diam eget risus varius blandit sit amet non magna. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec sed odio dui. Vestibulum id ligula porta felis euismod semper. Nullam id dolor id nibh ultricies vehicula ut id elit. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.</p>

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