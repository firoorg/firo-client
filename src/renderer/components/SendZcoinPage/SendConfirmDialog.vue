<template>
    <div class="send-confirm-dialog">
        <div  key="confirm-buttons" class="button-wrap">
            <div class="first-cell">
                <transition name="fade" mode="out-in">
                    <div v-if="isOpen" key="cancel-send">
                        <transition name="fade" mode="out-in">
                            <base-button v-if="timerDone && !confirmed"
                                         color="red"
                                         :is-outline="true"
                                         @click.prevent="onCancelFn"
                                         tabindex="5">
                                <span>Cancel</span>
                            </base-button>
                            <div v-else></div>
                        </transition>
                    </div>
                    <div v-else key="send-later">
                        <base-button class="add-to-queue"
                                     ref="addToQueue"
                                     :is-outline="true"
                                     @click.prevent="onQueueAddFn"
                                     :disabled="!canSubmit">
                            <span v-if="!hasQueuedPayments">Send Later</span>
                            <span v-else>Add To Queue</span>
                        </base-button>
                    </div>
                </transition>
            </div>
            <div class="second-cell" :style="{ minWidth: `${this.minCellWidth}px` }">
                <base-popover
                        :open="isOpen"
                        placement="top"
                        :popover-class="popoverClass"
                        class="confirmation-popover"
                        :boundaries-element="boundariesElement"
                        trigger="manually"
                >
                    <template slot="target">
                        <transition name="fade" mode="out-in">
                            <div v-if="isOpen" key="wait-confirm" class="wait-confirm">
                                <transition name="fade" mode="out-in">
                                    <base-button v-if="timerDone"
                                                 :disabled="!canSubmit"
                                                 key="confirm-send"
                                                 :color="greenOrWarning"
                                                 @click.prevent="onConfirmFn" tabindex="4">
                                        <span>Yes, send now!</span>
                                    </base-button>
                                    <circular-timer v-else
                                                    key="confirm-timer"
                                                    class="circular-timer"
                                                    :complete="onTimerDone" />
                                </transition>
                            </div>
                            <div v-else key="send">
                                <base-button key="confirm-trigger"
                                             :color="greenOrWarning"
                                             type="submit"
                                             class="submit"
                                             ref="submit"
                                             :disabled="!canSubmit"
                                             :tabindex="tabindex">
                                    <span v-if="!hasQueuedPayments">Send Now</span>
                                    <span v-else>Send Now</span>
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
    </div>
</template>

<script>
    import CircularTimer from '@/components/Icons/CircularTimer'

    export default {
        name: 'SendConfirmDialog',
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
            onQueueAdd: {
                type: Function,
                required: true
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
            },
            containsUsedAddress: {
                type: Boolean,
                required: true
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

        computed: {
            hasQueuedPayments () {
                return this.queuedPayments > 0
            },
            greenOrWarning () {
                return this.containsUsedAddress ? 'orange' : 'green'
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

            onQueueAddFn () {
                this.reset()
                this.onQueueAdd()
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
        display: grid;
        width: 100%;
        grid-template-columns: 1fr 1fr;
        grid-column-gap: emRhythm(1);

        & > div {
            // border: 1px solid rgba(255,0,0, 0.3);
            text-align: right;
            display: inline-block;

            & + div {
                text-align: left;
            }
        }

        .wait-confirm {
            text-align: center;
        }

        .circular-timer {
            display: inline-block;
        }
    }
</style>