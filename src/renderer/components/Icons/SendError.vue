<template>
    <div class="send-error-animation">
        <lottie :options="defaultOptions" />
    </div>
</template>

<script>
import Lottie from 'vue-lottie'
import animationData from '@/assets/animations/outgoing-payment-error.json'

export default {
    name: 'SendError',
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
