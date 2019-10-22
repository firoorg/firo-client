<template>
    <div
        class="znode"
        :class="{ 'is-missing': isMissing }"
    >
        <div>
            <header class="heading">
                <h2>{{ znode.label }}</h2>
                <p v-if="znode.authority.ip">
                    {{ znode.authority.ip }}
                </p>
            </header>

            <template v-if="isMissing">
                <div>
                    <p v-html="$t('znodes.my-znode.description__status-missing')" />
                </div>
            </template>
            <template v-else>
                <div class="znode-stats">
                    <section class="status">
                        <header>{{ $t('znodes.my-znode.label__status') }}</header>
                        <main>
                            <znode-status :status="znode.status" />
                        </main>
                    </section>
                    <section class="last-seen">
                        <header>{{ $t('znodes.my-znode.label__last-seen') }}</header>
                        <main>
                            <div v-if="znode.lastSeen">
                                <timeago
                                    :datetime="znode.lastSeen"
                                    :auto-update="30"
                                />
                            </div>

                            <div v-else>
                                N/A
                            </div>
                        </main>
                    </section>
                    <section class="active-since">
                        <header>{{ $t('znodes.my-znode.label__active-since') }}</header>
                        <main>
                            <div v-if="znode.activeSince">
                                <timeago
                                    :datetime="znode.activeSince"
                                    :auto-update="30"
                                />
                            </div>

                            <div v-else>
                                N/A
                            </div>
                        </main>
                    </section>
                    <template v-if="belongsToWallet">
                        <section class="next-payout">
                            <header>{{ $t('znodes.my-znode.label__next-payout') }}</header>
                            <main>
                                <template v-if="nextEstimatedPayout < Date.now()">
                                    {{ $t('znodes.my-znode.description__next-payout--soon') }}
                                </template>
                                <template v-else>
                                    <timeago
                                        v-if="lastPaidTime"
                                        :datetime="nextEstimatedPayout"
                                        :auto-update="30"
                                    />
                                </template>
                            </main>
                        </section>

                        <section class="last-payout">
                            <header>{{ $t('znodes.my-znode.label__last-payout') }}</header>
                            <main>
                                <timeago
                                    v-if="lastPaidTime"
                                    :datetime="lastPaidTime"
                                    :auto-update="30"
                                />
                                <span v-else>
                                    {{ $t('znodes.my-znode.description__last-payout--nothing-received') }}
                                </span>
                            </main>
                        </section>
                        <section class="received">
                            <header>{{ $t('znodes.my-znode.label__amount-received') }}</header>
                            <main>
                                {{ convertToCoin(payoutsReceived) }} XZC
                            </main>
                        </section>
                        <section class="payee">
                            <header>{{ $t('znodes.my-znode.label__payee') }}</header>
                            <main>{{ znode.payeeAddress }}</main>
                        </section>
                    </template>
                    <template v-else>
                        <notice class="does-not-belong">
                            {{ $t('znodes.my-znode.description__does-not-belong-to-wallet') }}
                        </notice>
                    </template>
                </div>
            </template>
        </div>

        <div
            v-if="!isMissing"
            ref="znodeActions"
            class="znode-actions"
        >
            <v-popover
                v-if="znode.status !== 'ENABLED'"
                :open="startZnodeStep !== 'initial'"
                placement="top-start"
                class="popover-and-button"
                popover-class="tooltip popover multi-step-popover"
                trigger="manually"
                :auto-hide="false"
                :handle-resize="true"
            >
                <base-button
                    v-if="startZnodeStep === 'initial'"
                    size="small"
                    color="comet"
                    @click.prevent="beginPassphraseStep"
                >
                    Start Znode
                </base-button>

                <base-button
                    v-if="startZnodeStep === 'passphrase'"
                    size="small"
                    color="green"
                    @click.prevent="tryStartZnode"
                >
                    Start Znode
                </base-button>

                <base-button
                    v-if="startZnodeStep === 'incorrectPassphrase'"
                    size="small"
                    color="green"
                    @click.prevent="beginPassphraseStep"
                >
                    Try Again
                </base-button>

                <base-button
                    v-if="startZnodeStep === 'error'"
                    size="small"
                    color="comet"
                    @click.prevent="closeStartZnodePopover"
                >
                    Ok
                </base-button>

                <base-button
                    v-if="startZnodeStep === 'success'"
                    size="small"
                    color="green"
                    @click.prevent="closeStartZnodePopover"
                >
                    Ok
                </base-button>

                <template slot="popover">
                    <div ref="popoverInterior">
                        <passphrase
                            v-if="['passphrase', 'incorrectPassphrase'].includes(startZnodeStep)"
                            v-model="passphrase"
                            :from-incorrect="startZnodeStep === 'incorrectPassphrase'"
                            @onEnter="tryStartZnode"
                        />

                        <error
                            v-if="startZnodeStep === 'error'"
                            :error-message="errorMessage"
                        />

                        <complete
                            v-if="startZnodeStep === 'success'"
                            message="Znode start message sent successfully!"
                        />
                    </div>
                </template>
            </v-popover>

            <base-button
                size="small"
                :is-outline="!isEnabled"
                :color="isEnabled ? 'comet' : ''"
                @click.prevent="openBlockExplorer"
            >
                {{ $t('znodes.my-znode.button__open-explorer') }}
            </base-button>
        </div>
    </div>
</template>

<script>
import { shell } from 'electron'
import { mapGetters } from 'vuex'
import { convertToCoin } from '#/lib/convert'
import Notice from '@/components/Notification/Notice'
import ZnodeStatus from '@/components/ZnodePage/ZnodeStatus'

import Passphrase from "@/components/PaymentSidebars/SendSteps/Passphrase";
import Error from "@/components/PaymentSidebars/SendSteps/Error";
import Complete from "@/components/PaymentSidebars/SendSteps/Complete";



export default {
    name: 'MyZnode',

    components: {
        ZnodeStatus,
        Notice,
        Passphrase,
        Error,
        Complete
    },

    props: {
        znode: {
            type: Object,
            required: true
        }
    },

    computed: {
        ...mapGetters({
            getExplorerAddressUrl: 'Settings/getExplorerAddressUrl',
            getZnodeRewardsReceivedAtAddress: 'Transactions/getZnodeRewardsReceivedAtAddress',
            addresses: 'Transactions/addresses',
            paymentPeriod: 'Znode/paymentPeriod',
            getLastPaidTime: 'Znode/getLastPaidTime'
        }),

        lastPaidTime () {
            return this.getLastPaidTime(this.znode.payeeAddress) * 1000;
        },

        isMissing () {
            return this.status === 'MISSING'
        },

        isEnabled () {
            return this.status === 'ENABLED'
        },

        payoutsReceived () {
            return this.getZnodeRewardsReceivedAtAddress(this.znode.payeeAddress);
        },

        belongsToWallet () {
            return !!this.addresses[this.znode.payeeAddress];
        },

        nextEstimatedPayout () {
            const t = this.lastPaidTime || this.znode.activeSince || Date.now();
            return (t + this.paymentPeriod - Date.now()) / 1000 / 24 / 60 / 60;
        }
    },

    data () {
        return {
            startZnodeStep: 'initial',
            passphrase: '',
            errorMessage: '',
            outsideClickListener: null
        }
    },

    methods: {
        convertToCoin,

        // We should be called when the passphrase step begins, to allow the user to close the dialog.
        // removeOutsideClickListener() MUST be called when the passphrase step is over.
        addOutsideClickListener() {
            this.outsideClickListener = (event) => {
                let isContainedWithin = false;
                for (const ref of ['znodeActions', 'popoverInterior']) {
                    if (this.$refs[ref] && this.$refs[ref].contains(event.target)) {
                        isContainedWithin = true;
                        break;
                    }
                }

                if (!isContainedWithin) {
                    this.onOutsideClick();
                }
            };

            document.addEventListener('click', this.outsideClickListener);
        },

        removeOutsideClickListener() {
            document.removeEventListener('click', this.outsideClickListener);
            this.outsideClickListener = null;
        },

        // Click outside the passphrase dialog to close it.
        onOutsideClick() {
            if (['passphrase', 'incorrectPassphrase'].includes(this.startZnodeStep)) {
                this.startZnodeStep = 'initial';
                this.removeOutsideClickListener();
            }
        },

        beginPassphraseStep() {
            this.passphrase = '';
            this.startZnodeStep = 'passphrase';
            this.addOutsideClickListener();
        },

        beginIncorrectPassphraseStep() {
            this.passphrase = '';
            this.startZnodeStep = 'incorrectPassphrase';
        },

        // Attempt to start the Znode.
        async tryStartZnode() {
            try {
                await this.$daemon.startZnode(this.passphrase, this.znode.label);
            } catch (e) {
                if (e.name === 'ZcoindErrorResponse') {
                    this.removeOutsideClickListener();
                    this.beginErrorStep(e.message);
                    return;
                } else if ((e.error && e.error.code === -14)) {
                    // Going to the incorrect passphrase step, we do NOT want to removeOutsideClickListener().
                    this.beginIncorrectPassphraseStep();
                    return;
                } else {
                    this.removeOutsideClickListener();
                    throw e;
                }
            }

            this.removeOutsideClickListener();
            this.startZnodeStep = 'success';
        },

        beginErrorStep(message) {
            this.errorMessage = message;
            this.startZnodeStep = 'error';
        },

        closeStartZnodePopover() {
            this.startZnodeStep = 'initial';
        },

        openBlockExplorer () {
            shell.openExternal(this.getExplorerAddressUrl(this.znode.payeeAddress))
        }
    }
}
</script>

<style lang="scss" scoped>
    .znode {
        background: $color--polo-light;
        @include box-shadow-large();
        @include glow-small-box();
        padding: emRhythm(5) emRhythm(4);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: background 0.25s ease-in-out;

        &.is-missing {
            background: rgba($color--polo-light, 0.75);
        }

        .heading {
            padding-bottom: emRhythm(4);

            h2 {
                padding-top: 0;
                margin: 0;
            }

            p {
                margin: emRhythm(1) 0 0;
                @include font-medium();
                font-style: italic;
                color: $color--comet;
            }
        }

        .znode-stats {
            display: grid;
            grid-template-areas: "status last-seen active-since"
                                 "next-payout last-payout received"
                                 "payee payee payee";
            grid-template-columns: 33%;
            grid-column-gap: emRhythm(1);
            grid-row-gap: emRhythm(1);

            header {
                @include font-medium();
                font-style: italic;
                color: $color--comet;
            }

            .status { grid-area: status; }
            .last-seen { grid-area: last-seen; }
            .active-since { grid-area: active-since; }
            .next-payout { grid-area: next-payout; }
            .last-payout { grid-area: last-payout; }
            .received { grid-area: received; }
            .payee, .does-not-belong { grid-area: payee; }
        }

        .znode-actions {
            margin-top: emRhythm(5);
            text-align: right;
        }

        .popover-and-button {
            display: inline-block;

            .popover {
                max-width: 30%;
                overflow-wrap: break-word;
            }
        }
    }
</style>
