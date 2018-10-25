<template>
    <div class="successfully-send-animation">
        <lottie :options="defaultOptions" />
    </div>
</template>

<script>
    import Lottie from 'vue-lottie'
    import animationData from '@/assets/animations/outgoing-payment.json'

    export default {
        name: 'SuccessfullySend',
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
