<template>
    <div class="circular-timer" :style="{ width: `${diameter}px`, height: `${diameter/4*3 + 5}px`, top: `${top}px` }">
        <div class="wrap">
        <radial-progress-bar ref="foo"
                             :diameter="diameter"
                             :completed-steps="completedSteps"
                             :animation="{ duration }"
                             :total-steps="totalSteps"
                             :stroke-width="8"
                             stop-color="#383853"
                             start-color="#383853"
                             inner-stroke-color="#ccc">
        </radial-progress-bar>
        </div>
    </div>
</template>

<script>
    import RadialProgressBar from 'vue-radial-progress'

    export default {
        props: {
            complete: {
                type: Function,
                required: true
            }
        },
        data () {
            return {
                completedSteps: 0,
                totalSteps: 3,
                diameter: 51,
                top: -3,
                duration: 1000,
                interval: null
            }
        },

        components: {
            RadialProgressBar
        },

        mounted () {
            this.interval = setInterval(() => {
                this.completedSteps++

                if (this.completedSteps > this.totalSteps) {
                    this.stop()
                    this.complete()
                }
            }, this.duration)
        },

        beforeDestroy () {
            this.stop()
        },

        methods: {
            stop () {
                if (this.interval) {
                    clearInterval(this.interval)
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .circular-timer {
        position: relative;
    }

    .wrap {
        position: absolute;
    }
</style>