<template>
    <section class="send-zcoin-form">
        <div v-scrollable>
            <form class="send">
                <div class="grid">
                    <div class="form">
                        <header>
                            <h2>
                                Send Zcoin
                            </h2>
                        </header>

                        <p class="public-send-warning">
                            Zcoin you send with Public Send will be visible by everyone. Maybe you want to use
                            Private Send instead?
                        </p>


                        <fieldset>
                            <div class="field">
                                <label for="label">
                                    {{ $t('send.public.detail-public-send.label__label') }}
                                </label>

                                <div class="control">
                                    <input
                                        id="label"
                                        ref="label"
                                        v-model.trim="label"
                                        v-focus
                                        type="text"
                                        name="label"
                                        tabindex="1"
                                        :placeholder="$t('send.public.detail-public-send.placeholder__label')"
                                    />
                                </div>
                            </div>

                            <div class="field">
                                <label for="address">
                                    {{ $t('send.public.detail-public-send.label__address') }}
                                </label>

                                <div class="control">
                                    <input
                                        id="address"
                                        ref="address"
                                        v-model.trim="address"
                                        type="text"
                                        name="address"
                                        tabindex="2"
                                        :placeholder="$t('send.public.detail-public-send.placeholder__address')"
                                    />
                                </div>
                            </div>

                            <div class="field amount-field">
                                <label for="amount">
                                    {{ $t('send.public.detail-public-send.label__amount') }}
                                </label>

                                <div class="control">
                                    <input
                                        id="amount"
                                        ref="amount"
                                        v-model="amount"
                                        type="text"
                                        name="amount"
                                        class="amount"
                                        tabindex="3"
                                        :placeholder="$t('send.public.detail-public-send.placeholder__amount')"
                                    />
                                    <div class="prefix">
                                        XZC
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                    </div>

                    <div class="buttons">
                        <base-button
                            v-if="['confirm', 'passphrase'].includes(sendPopoverStep)"
                            color="red"
                            :is-dark="true"
                            :is-outline="true"
                            @click.prevent="closeSendPopover"
                        >
                            Cancel
                        </base-button>

                        <v-popover
                            :open="sendPopoverStep !== 'initial'"
                            placement="top-end"
                            popover-class="tooltip popover multi-step-popover"
                            class="send-button-popover-container"
                            trigger="manually"
                            :auto-hide="false"
                            :handle-resize="true"
                        >
                            <base-button
                                v-if="sendPopoverStep === 'initial'"
                                color="green"
                                class="expanded"
                                @click.prevent="beginWaitStep"
                            >
                                Send
                            </base-button>

                            <circular-timer
                                v-else-if="sendPopoverStep === 'wait'"
                                @complete="beginConfirmStep"
                            />

                            <base-button
                                v-else-if="sendPopoverStep === 'confirm'"
                                color="green"
                                @click.prevent="beginPassphraseStep"
                            >
                                Confirm
                            </base-button>

                            <base-button
                                v-else-if="sendPopoverStep === 'passphrase'"
                                color="green"
                                @click.prevent="attemptSend"
                            >
                                Send
                            </base-button>

                            <div
                                v-else-if="sendPopoverStep === 'complete'"
                                class="ok-icon"
                            >
                                ✓
                            </div>

                            <template slot="popover">
                                <send-step-confirm
                                    v-if="['wait', 'confirm'].includes(sendPopoverStep)"
                                    :label="label"
                                    :address="address"
                                    :amount="satoshiAmount"
                                    :fee="0"
                                />

                                <send-step-passphrase
                                    v-else-if="sendPopoverStep === 'passphrase'"
                                    v-model="passphrase"
                                    @onEnter="attemptSend"
                                />

                                <send-step-complete
                                    v-else-if="sendPopoverStep === 'complete'"
                                />
                            </template>
                        </v-popover>
                    </div>
                </div>
            </form>
        </div>
    </section>
</template>

<script>
import SendStepConfirm from '@/components/SendPage/SendStepConfirm';
import SendStepPassphrase from "@/components/SendPage/SendStepPassphrase";
import SendStepComplete from '@/components/SendPage/SendStepComplete';
import CircularTimer from "@/components/Icons/CircularTimer";

import {convertToSatoshi} from '#/lib/convert';

export default {
    name: 'Send',

    components: {
        SendStepPassphrase,
        CircularTimer,
        SendStepConfirm,
        SendStepComplete
    },

    data () {
        return {
            label: '',
            amount: '',
            address: '',
            passphrase: '',

            // Valid progressions are:
            //
            // initial -> wait
            // wait -> confirm
            // confirm -> initial | passphrase
            // passphrase -> initial | error | complete
            // error -> initial | passphrase
            // complete -> initial
            sendPopoverStep: 'initial',

            // If we're in the process of sending, we want to ignore any new send requests.
            ignoreSend: false,

            // ValidationMixin
            validationFieldOrder: [
                'label',
                'amount',
                'address'
            ]
        }
    },

    computed: {
        satoshiAmount () {
            return convertToSatoshi(this.amount);
        }
    },

    methods: {
        cleanupForm () {
            this.label = '';
            this.amount = '';
            this.address = '';
            this.passphrase = '';
            this.ignoreSend = false;
            this.closeSendPopover();
        },

        recalculatePopoverPosition () {
            // v-popover only knows to recalculate position on resize events, so fake that one happened in order to
            // trigger the update.
            window.dispatchEvent(new Event('resize'));
        },

        beginWaitStep () {
            this.sendPopoverStep = 'wait';
            this.recalculatePopoverPosition();
        },

        beginConfirmStep () {
            this.sendPopoverStep = 'confirm';
            this.recalculatePopoverPosition();
        },

        beginPassphraseStep () {
            this.passphrase = '';
            this.sendPopoverStep = 'passphrase';
            this.recalculatePopoverPosition();
        },

        async attemptSend () {
            // Ignore the request to send if the user clicked the Send button twice in quick succession. this.ignoreSend
            // will be reset along with all our other data in cleanupForm().
            //
            // JavaScript is single threaded, so there should be no race condition possible with an interruption between
            // the value check and the value assignment.
            if (this.ignoreSend) {
                return;
            }
            this.ignoreSend = true;

            try {
                console.log(await this.$daemon.publicSend(this.passphrase, this.label, this.address, this.satoshiAmount, 1));
            } catch (e) {
                console.log("publicSend failed!");
                console.log(e);
                this.beginPassphraseStep();
                return;
            }

            this.beginCompleteStep();
        },

        beginCompleteStep () {
            this.sendPopoverStep = 'complete';
            this.recalculatePopoverPosition();

            setTimeout(() => this.cleanupForm(), 1000);
        },

        closeSendPopover () {
            this.passphrase = '';
            this.sendPopoverStep = 'initial';
        }
    }
}
</script>

<style lang="scss" scoped>
.send-zcoin-form {
    height: 100vh;

    .public-send-warning {
        @include description();
        margin-bottom: emRhythm(7);
    }
}

.send {
    padding: emRhythm(5) emRhythm(6) 0;
    height: 100vh;
    box-sizing: border-box;
}

.grid {
    display: grid;
    grid-template-rows: auto auto;
    height: 100%;
    @include bleed-h(3);
}

.form {
    & > header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    ::selection {
        color: $color--white-light;
        background: $color--dark;
    }
}

fieldset {
    margin: 0;
    padding: 0;
    border: none;

    input[type="text"],
    select,
    .message {
        @include light-input();
    }

    .prefix {
        color: $color--polo-dark;
    }
}

.button-wrap {
    padding-bottom: emRhythm(5);
}

.debug {
    align-self: end;
}

button, .send-button-popover-container {
    display: inline-block;
}

.buttons {
    text-align: center;
}

button {
    width: 10em;

    &.expanded {
        width: 20em;
    }
}

.ok-icon {
    font-size: 3em;
}

.popover {
    background-color: $color--comet-dark;
}
</style>
