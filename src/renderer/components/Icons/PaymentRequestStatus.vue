<template>
    <div class="payment-request-status-animation">
        <lottie :options="defaultOptions"
                @animCreated="handleAnimation" />
    </div>
</template>

<script>
    import Lottie from 'vue-lottie'
    // import animationData from '@/assets/animations/pending-to-check-v3.json'
    import animationData from '@/assets/animations/payment-request-states.json'

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
                },
                frames: {
                    isPending: 60,
                    isIncoming: 143,
                    isFulfilled: 182,
                    isReused: 215
                }
            }
        },
        methods: {
            handleAnimation (anim) {
                this.anim = anim

                if (this.isIncoming) {
                    this.anim.goToAndStop(this.frames.isIncoming, true)
                } else if (this.isFulfilled) {
                    this.anim.goToAndStop(this.frames.isFulfilled, true)
                } else if (this.isReused) {
                    this.anim.goToAndStop(this.frames.isReused, true)
                } else {
                    this.anim.goToAndStop(this.frames.isPending, true)
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
            isIncoming (newVal) {
                const { isPending, isIncoming } = this.frames

                if (newVal) {
                    this.anim.playSegments([ isPending, isIncoming ])
                }
            },

            isFulfilled (newVal) {
                const { isIncoming, isFulfilled } = this.frames

                if (newVal) {
                    this.anim.playSegments([ isIncoming, isFulfilled ])
                }
            },

            isReused (newVal) {
                const { isFulfulled, isReused } = this.frames

                if (newVal) {
                    this.anim.playSegments([ isFulfulled, isReused ])
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .payment-request-status-animation {
        height: 100%;
        display: inline-block;
        padding-left: emRhythm(1);
    }

    /deep/ svg {
        width: auto !important;
        // background: rgba(255,0,0,0.2);
    }
</style>
