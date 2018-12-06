<template>
    <div class="payment-request-pending-animation">
        <lottie
            :options="defaultOptions"
            @animCreated="handleAnimation"
        />
    </div>
</template>

<script>
import Lottie from 'vue-lottie'
import animationData from '@/assets/animations/pending-v3.json'

export default {
    name: 'PaymentRequestPending',
    components: {
        Lottie
    },
    props: {
        received: Boolean,
        default: false
    },
    data () {
        return {
            defaultOptions: {
                animationData,
                loop: false,
                autoplay: false
            }
        }
    },

    watch: {
        received (newVal, oldVal) {
            console.log('received changed from', oldVal, newVal)
            if (newVal) {
                this.anim.play()
            }
        }
    },
    methods: {
        handleAnimation (anim) {
            this.anim = anim

            if (this.received) {
                this.anim.goToAndStop(this.anim.getDuration(true), true)
            }
        },

        stop () {
            this.anim.stop()
        },

        play () {
            this.anim.play()
        },

        pause () {
            this.anim.pause()
        },

        onSpeedChange () {
            this.anim.setSpeed(this.animationSpeed)
        }
    }
}
</script>

<style lang="scss" scoped>
</style>
