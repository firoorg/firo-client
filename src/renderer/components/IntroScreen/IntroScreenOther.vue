<template>
    <div>
        <h1>Other</h1>

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
        name: 'IntroScreenOther',
        mixins: [
            GuideStepMixin
        ]
    }
</script>

<style scoped>

</style>