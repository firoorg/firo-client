<template>
    <div class="payment-request-status-animation">
    <lottie :options="defaultOptions"
            @animCreated="handleAnimation" />
    </div>
</template>

<script>
    import Lottie from 'vue-lottie'
    import animationData from '@/assets/animations/payment-request-status.json'

    console.log(animationData)

    export default {
        name: 'PaymentRequestStatus',
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
                },
                animationSpeed: 1
            }
        },
        methods: {
            handleAnimation (anim) {
                this.anim = anim
                if (this.received) {
                    this.anim.goToAndStop(50)
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
        },

        watch: {
            received (newVal, oldVal) {
                console.log('received changed from', oldVal, newVal)
                if (newVal) {
                    this.anim.play()
                }
            }
        }
    }
</script>

<style lang="scss">
    .payment-request-status-animation {
        svg > g {
            @include glow-huge-box()
        }
    }
</style>