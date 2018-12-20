<template>
    <div class="overlay-success-animation">
        <lottie :options="defaultOptions" />
    </div>
</template>

<script>
import Lottie from 'vue-lottie'
import animationData from '@/assets/animations/overlay-success-white.json'

export default {
    name: 'OverlaySuccess',
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
