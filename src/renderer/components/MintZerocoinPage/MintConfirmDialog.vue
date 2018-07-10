<template>
    <div class="mint-confirm-dialog">
        <div  key="confirm-buttons" class="button-wrap">
            <base-popover
                    :open="isOpen && !timerDone"
                    placement="top"
                    :popover-class="popoverClass"
                    class="confirmation-popover"
                    :boundaries-element="boundariesElement"
                    :delay="300"
                    trigger="manually"
            >
                <template slot="target">
                    <transition name="fade" mode="out-in">
                        <div v-if="isOpen" key="wait-confirm" class="wait-confirm">
                            <transition name="fade" mode="out-in">
                                <base-button v-if="timerDone"
                                             :disabled="!canSubmit"
                                             key="confirm-send"
                                             color="green"
                                             @click.prevent="onConfirmFn" tabindex="4">
                                    <span>Yes, mint now!</span>
                                </base-button>
                                <circular-timer v-else
                                                key="confirm-timer"
                                                class="circular-timer"
                                                :complete="onTimerDone" />
                            </transition>
                        </div>
                        <div v-else key="mint">
                            <base-button key="confirm-trigger"
                                         color="green"
                                         type="submit"
                                         class="submit"
                                         ref="submit"
                                         :disabled="!canSubmit"
                                         :tabindex="tabindex">
                                <span>Start Minting</span>
                            </base-button>
                        </div>
                    </transition>
                </template>

                <template slot="content">
                    <slot />
                </template>
            </base-popover>
        </div>
    </div>
</template>

<script>
    import CircularTimer from '@/components/Icons/CircularTimer'

    export default {
        name: 'MintConfirmDialog',
        components: {
            CircularTimer
        },
        props: {
            canSubmit: {
                type: Boolean,
                required: true
            },
            isOpen: {
                type: Boolean,
                required: true
            },
            boundariesElement: {
                required: false
            },

            onCancel: {
                type: Function,
                required: true
            },
            onConfirm: {
                type: Function,
                required: true
            },
            queuedPayments: {
                type: Number,
                required: false,
                default: 0
            },
            popoverClass: {
                type: String
            },
            tabindex: {
                type: String
            }
        },

        data () {
            return {
                timerDone: false,
                confirmed: false,
                minCellWidth: 0
            }
        },

        mounted () {
            this.minCellWidth = this.$refs.submit.$el.clientWidth
        },

        watch: {
            // reset timer done on close
            isOpen (newVal, oldVal) {
                if (!newVal) {
                    this.timerDone = false
                }
            }
        },

        computed: {
            hasQueuedPayments () {
                return this.queuedPayments > 0
            }
        },

        methods: {
            onTimerDone () {
                this.timerDone = true
            },

            onCancelFn () {
                this.reset()
                this.onCancel()
            },

            onConfirmFn () {
                // this.reset()
                this.confirmed = true

                this.onConfirm(this.reset)
            },

            reset () {
                this.timerDone = false
            }
        }
    }
</script>

<style lang="scss" scoped>
    .send-confirm-dialog /deep/ .trigger {
        width: 100%;
        // border: 2px solid rgba(0,0,255, 0.3);
    }

    .button-wrap {
        width: 100%;
        text-align: center;

        .wait-confirm {
            text-align: center;
        }

        .circular-timer {
            display: inline-block;
        }
    }
</style>