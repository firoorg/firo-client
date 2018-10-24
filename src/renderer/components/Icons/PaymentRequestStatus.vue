<template>
    <div class="payment-request-status-animation">
        <lottie :options="defaultOptions"
                @animCreated="handleAnimation" />
    </div>
</template>

<script>
    import Lottie from 'vue-lottie'
    // import animationData from '@/assets/animations/pending-to-check-v3.json'
    import animationData from '@/assets/animations/arrow_incoming.json'

    export default {
        name: 'PaymentRequestStatus',
        components: {
            Lottie
        },
        props: {
            isFulfilled: {
                type: Boolean,
                default: false
            },
            isIncoming: {
                type: Boolean,
                default: false
            },
            isReused: {
                type: Boolean,
                default: false
            }
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
        methods: {
            handleAnimation (anim) {
                this.anim = anim

                if (this.isFulfilled) {
                    // this.anim.goToAndStop(this.anim.getDuration(true), true)
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
            isFulfilled (newVal, oldVal) {
                console.log('isFulfilled changed from', oldVal, newVal)
                if (newVal) {
                    this.anim.play()
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .payment-request-status-animation {
        height: 100%;
        display: inline-block;
    }

    /deep/ svg {
        width: auto !important;
        // background: rgba(255,0,0,0.2);
    }
</style>
