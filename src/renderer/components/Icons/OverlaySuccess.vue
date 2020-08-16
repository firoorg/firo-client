<template>
    <div class="overlay-success-animation">
        <lottie
            :options="defaultOptions"
            @animCreated="handleAnimation"
        />
    </div>
</template>

<script>
import Lottie from 'vue-lottie'
import animationData from 'renderer/assets/animations/overlay-success-white.json'

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
            anim: null,
            defaultOptions: {
                animationData,
                loop: false,
                autoplay: true
            }
        }
    },

    beforeDestroy() {
        if (!this.anim) {
            return
        }

        this.anim.removeEventListener('complete', this.onAnimationEnd)
    },

    methods: {
        handleAnimation (anim) {
            this.anim = anim

            this.anim.addEventListener('complete', this.onAnimationEnd)
        },
    }
}
</script>

<style lang="scss" scoped>
</style>
