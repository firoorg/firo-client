<template>
    <div class="send-confirmation-check-animation">
        <lottie :options="defaultOptions" />
    </div>
</template>

<script>
import Lottie from 'vue-lottie'
import animationData from 'renderer/assets/animations/confirmation-check.json'

export default {
    name: 'SendConfirmationCheck',
    components: {
        Lottie
    },
    props: {
        onAnimationEnd: {
            type: Function,
            default: () => {}
        }
    },

    data () {
        return {
            defaultOptions: {
                animationData,
                loop: false,
                autoplay: true
            }
        }
    }
}
</script>

<style lang="scss" scoped>
</style>
