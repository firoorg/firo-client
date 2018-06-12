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
    export default {
        name: 'IntroScreenOther',
        props: [
            'onNext'
        ]
    }
</script>

<style scoped>

</style>