<template>
    <div>
        <div class="warning-header">
            <div v-if="isSparkAllowed && availableLelantus > 0 && currentBlockHeight < lelantusGracefulPeriod">
                Firo is migrating to Spark. Redemption of coins in Lelantus will be disabled at block {{ lelantusGracefulPeriod }}. Current block is {{ currentBlockHeight }}.
                <a id="anonymize-firo-link" @click="showLelantusToSparkDialog = true">Click here</a> to migrate {{ bigintToString(availableLelantus) }} FIRO from Lelantus.
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
                <a id="anonymize-firo-link" @click="showAnonymizeDialog = true">Click here</a> to secure
                {{ nTokensNeedingAnonymization > 1 || availablePublic ? "them" : "it" }}.
            </div>
        </div>

        <Popup v-if="showLelantusToSparkDialog" >
             <LelantusToSparkDialog
                @migrate="showLelantusToSparkDialog = false"
                @ignore="showLelantusToSparkDialog = false"
            />
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
import LelantusToSparkDialog from "renderer/components/LelantusToSparkDialog";
import PassphraseInput from "renderer/components/shared/PassphraseInput";
import {IncorrectPassphrase, FirodErrorResponse} from "daemon/firod";
import WaitOverlay from "renderer/components/shared/WaitOverlay";

export default {
    name: "AwaitingAnonymizationHeader",

    components: {
        Popup,
        AnonymizeDialog,
        LelantusToSparkDialog,
        PassphraseInput,
        WaitOverlay
    },

    data() {
        return {
            showAnonymizeDialog: false,
            showLelantusToSparkDialog: false,
            passphrase: '',
            show: 'button',
            waiting: false,
            error: null,
        };
    },

    computed: {
        ...mapGetters({
            availablePublic: 'Balance/availablePublic',
            enableElysium: 'App/enableElysium',
            tokensNeedingAnonymization: 'Elysium/tokensNeedingAnonymization',
            isSparkAllowed: 'ApiStatus/isSparkAllowed',
            availableLelantus: 'Balance/availableLelantus',
            currentBlockHeight: 'ApiStatus/currentBlockHeight',
            lelantusGracefulPeriod: 'ApiStatus/lelantusGracefulPeriod',
        }),

        nTokensNeedingAnonymization() {
            if (!this.enableElysium) return 0;
            return this.tokensNeedingAnonymization.map(x=>x[0]).sort().reduce((a, x) => a[a.length-1] == x ? a : [...a, x], []).length;
        }
    },

    methods: {
        bigintToString,

        closeDialog() {
            this.showAnonymizeDialog = false;
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/warning-header";
</style>