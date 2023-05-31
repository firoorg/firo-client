<template>
    <div>
        <div class="warning-header">
            <div v-if="isSpark && availableLelantus > 0">
                <a id="anonymize-firo-link" href="#" @click="show = 'lelantustospark'">Click here</a> to migrate funds from Lelantus to Spark.
            </div>
            <div v-else>
                <span v-if="availablePublic && nTokensNeedingAnonymization > 1">
                    {{ bigintToString(availablePublic) }} FIRO and {{ nTokensNeedingAnonymization }} Elysium tokens
                    awaiting anonymization.
                </span>
                <span v-else-if="availablePublic && nTokensNeedingAnonymization">
                    {{ bigintToString(availablePublic) }} FIRO and 1 Elysium token awaiting anonymization.
                </span>
                <span v-else-if="nTokensNeedingAnonymization > 1">
                    {{ nTokensNeedingAnonymization }} Elysium tokens awaiting anonymization.
                </span>
                <span v-else-if="nTokensNeedingAnonymization">
                    1 Elysium token awaiting anonymization.
                </span>
                <span v-else-if="availablePublic">
                    {{ bigintToString(availablePublic) }} FIRO awaiting anonymization.
                </span>
                <a id="anonymize-firo-link" href="#" @click="showAnonymizeDialog = true">Click here</a> to secure
                {{ nTokensNeedingAnonymization > 1 || availablePublic ? "them" : "it" }}.
            </div>
        </div>

        <Popup v-if="show === 'lelantustospark'" >
             <LelantusToSpark
                @migrate="goToPassphraseStep()"
            />
        </Popup>

        <Popup v-if="show === 'passphrase'" >
            <PassphraseInput :error="error" v-model="passphrase" @cancel="cancel()" @confirm="attemptSend" />
        </Popup>

        <Popup v-if="show === 'wait'" >
            <WaitOverlay />
        </Popup>

        <Popup v-if="showAnonymizeDialog" >
            <AnonymizeDialog
                @cancel="showAnonymizeDialog = false"
                @complete="showAnonymizeDialog = false"
            />
        </Popup>
    </div>
</template>

<script>
import {mapGetters} from "vuex";
import {bigintToString} from "lib/convert";
import Popup from "renderer/components/shared/Popup";
import AnonymizeDialog from "renderer/components/AnonymizeDialog";
import LelantusToSpark from "renderer/components/SendPage/LelantusToSpark";
import PassphraseInput from "renderer/components/shared/PassphraseInput";
import {IncorrectPassphrase, FirodErrorResponse} from "daemon/firod";
import WaitOverlay from "renderer/components/shared/WaitOverlay";

export default {
    name: "AwaitingAnonymizationHeader",

    components: {
        Popup,
        AnonymizeDialog,
        LelantusToSpark,
        PassphraseInput,
        WaitOverlay
    },

    data() {
        return {
            showAnonymizeDialog: false,
            passphrase: '',
            show: 'button'
        };
    },

    computed: {
        ...mapGetters({
            availablePublic: 'Balance/availablePublic',
            enableElysium: 'App/enableElysium',
            tokensNeedingAnonymization: 'Elysium/tokensNeedingAnonymization',
            isSparkAllowed: 'ApiStatus/isSparkAllowed',
            availableLelantus: 'Balance/availableLelantus',
        }),

        nTokensNeedingAnonymization() {
            if (!this.enableElysium) return 0;
            return this.tokensNeedingAnonymization.map(x=>x[0]).sort().reduce((a, x) => a[a.length-1] == x ? a : [...a, x], []).length;
        },
        
        isSpark() {
            return this.isSparkAllowed[0]
        }
    },

    methods: {
        bigintToString,

        closeDialog() {
            this.showAnonymizeDialog = false;
        },

        cancel() {
            this.passphrase = '';
            this.error = null;
            this.lelantustospark = false;
            this.show = 'button';
            this.$emit('cancel')
        },

        goToPassphraseStep() {
            this.show = 'passphrase';
        },

        async attemptSend () {
            this.show = 'wait';
            const passphrase = this.passphrase;
            this.passphrase = '';
            try {
                await $daemon.lelantusToSpark(passphrase);
            } catch (e) {
                    if (e instanceof IncorrectPassphrase) {
                        this.error = 'Incorrect Passphrase';
                        this.waiting = false;
                        return;
                    } else if (e instanceof FirodErrorResponse) {
                        errors.push(e.errorMessage);
                    } else {
                        errors.push(`${e}`);
                    }
                }
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/warning-header";
</style>