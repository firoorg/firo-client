<template>
    <div class="payment-status-animation" @click="onClick">
        <lottie :options="defaultOptions"
                @animCreated="handleAnimation" />
    </div>
</template>

<script>
    import Lottie from 'vue-lottie'
    // import animationData from '@/assets/animations/pending-to-check-v3.json'
    import animationData from '@/assets/animations/payment-states.json'

    export default {
        name: 'PaymentStatus',
        components: {
            Lottie
        },
        props: {
            isConfirmed: {
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

                if (this.isConfirmed) {
                    this.anim.goToAndStop(this.anim.getDuration(true) - 15, true)
                }
            },

            onClick () {
                console.log('clicked')
                this.isConfirmed = !this.isConfirmed
            }
        },

        watch: {
            isConfirmed (newVal) {
                if (newVal) {
                    console.log('start to play')
                    this.anim.play()
                } else {
                    this.anim.goToAndPlay(0)
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
