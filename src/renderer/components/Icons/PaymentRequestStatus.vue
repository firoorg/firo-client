<template>
    <div class="payment-request-status-animation">
        <lottie
            :options="defaultOptions"
            @animCreated="handleAnimation"
        />
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
                autoplay: false,
                autoloadSegments: false
            },
            frames: {
                isPending: 60,
                isIncoming: 143,
                isFulfilled: 182,
                isReused: 215
            },
            stopAtFrame: 60
        }
    },

    watch: {
        isIncoming (newVal) {
            const { isIncoming } = this.frames

            if (newVal) {
                this.stopAtFrame = isIncoming
                this.anim.play()
            }
        },

        isFulfilled (newVal) {
            const { isFulfilled } = this.frames

            if (newVal) {
                this.stopAtFrame = isFulfilled
                this.anim.play()
            }
        },

        isReused (newVal) {
            const { isReused } = this.frames

            if (newVal) {
                this.stopAtFrame = isReused
                this.anim.play()
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

            this.anim.addEventListener('enterFrame', (el) => {
                if (el.currentTime > this.stopAtFrame) {
                    this.anim.pause()
                }
            })
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
