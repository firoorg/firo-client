<template>
    <div class="mint-started-animation">
        <lottie :options="defaultOptions" />
    </div>
</template>

<script>
import Lottie from 'vue-lottie'
import animationData from 'renderer/assets/animations/mint-success.json'

export default {
    name: 'MintStarted',
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
