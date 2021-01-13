<template>
    <div>
        <WaitOverlay v-if="waiting" />

        <div v-else class="anonymize-dialog">
            <div class="title">
                Secure {{ convertToCoin(availablePublic) }} FIRO
            </div>

            <div class="content">
                <input
                    v-focus
                    v-model="passphrase"
                    type="password"
                    name="passphrase"
                    placeholder="Enter Your Passphrase"
                    @keyup.enter="tryAnonymize()"
                />

                <div v-if="error" class="error">
                    {{ error }}
                </div>
            </div>

            <div class="buttons">
                <button @click="cancel()">
                    Cancel
                </button>

                <button :disabled="!passphrase" @click="tryAnonymize()">
                    Confirm
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import {convertToCoin} from "lib/convert";
import {mapGetters} from "vuex";
import {getDenominationsToMintSubtractingFee} from "lib/convert";
import WaitOverlay from "renderer/components/shared/WaitOverlay";
import {IncorrectPassphrase, FirodErrorResponse} from "daemon/firod";
import {fromPairs} from "lodash";

export default {
    name: "AnonymizeDialog",
    components: {WaitOverlay},
    data() {
        return {
            error: null,
            passphrase: '',
            waiting: false
        };
    },

    computed: mapGetters({
        availablePublic: 'Balance/availablePublic',
        isLelantusAllowed: 'ApiStatus/isLelantusAllowed'
    }),

    methods: {
        convertToCoin,

        cancel() {
            this.passphrase = '';
            this.error = null;
            this.$emit('cancel')
        },

        async tryAnonymize() {
            const passphrase = this.passphrase;

            this.error = null;
            this.passphrase = '';
            this.waiting = true;

            if (this.isLelantusAllowed) {
                try {
                    await $daemon.mintAllLelantus(passphrase);
                } catch (e) {
                    if (e instanceof IncorrectPassphrase) {
                        this.error = 'Incorrect Passphrase';
                    } else if (e instanceof FirodErrorResponse) {
                        this.error = e.errorMessage;
                    } else {
                        this.error = `${e}`;
                    }

                    this.waiting = false;
                    return;
                }
            } else {
                let remainingMint = this.availablePublic;
                let mintAmount = 0;
                while (mintAmount = Math.min(remainingMint, 500e8)) {
                    if (mintAmount < 0.051e8) break;
                    remainingMint -= mintAmount;

                    const toMint = fromPairs(
                        Object.entries(getDenominationsToMintSubtractingFee(mintAmount))
                            .map(([k, v]) => [convertToCoin(k), v])
                    );

                    try {
                        await $daemon.mintSigma(passphrase, toMint);
                    } catch (e) {
                        if (e instanceof IncorrectPassphrase) {
                            this.error = 'Incorrect Passphrase';
                        } else if (e instanceof FirodErrorResponse) {
                            this.error = e.errorMessage;
                        } else {
                            this.error = `${e}`;
                        }

                        this.waiting = false;
                        return;
                    }
                }
            }

            this.waiting = false;
            this.$emit('complete');
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/colors";
@import "src/renderer/styles/popup";
@import "src/renderer/styles/sizes";
@import "src/renderer/styles/inputs";
@import "src/renderer/styles/typography";

.anonymize-dialog {
    @include popup();
    color: $color-text;

    input[type="password"] {
        @include wide-input-field();
    }

    .error {
        margin-top: $size-between-field-space-big;
        @include error();
    }
}
</style>