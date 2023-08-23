<template>
    <div>
        <div class="warning-header">
            <div>
                <span v-if="toAnonymize && nTokensNeedingAnonymization > 1">
                    {{ bigintToString(toAnonymize) }} FIRO and {{ nTokensNeedingAnonymization }} Elysium tokens
                    awaiting anonymization.
                </span>
                <span v-else-if="toAnonymize && nTokensNeedingAnonymization">
                    {{ bigintToString(availablePublic) }} FIRO and 1 Elysium token awaiting anonymization.
                </span>
                <span v-else-if="nTokensNeedingAnonymization > 1">
                    {{ nTokensNeedingAnonymization }} Elysium tokens awaiting anonymization.
                </span>
                <span v-else-if="nTokensNeedingAnonymization">
                    1 Elysium token awaiting anonymization.
                </span>
                <span v-else-if="toAnonymize">
                    {{ bigintToString(toAnonymize) }} FIRO awaiting anonymization.
                </span>
                <a id="anonymize-firo-link" @click="showAnonymizeDialog = true">Click here</a> to secure
                {{ nTokensNeedingAnonymization > 1 || toAnonymize ? "them" : "it" }}.
            </div>
        </div>

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
import Popup from "renderer/components/shared/Popup.vue";
import AnonymizeDialog from "renderer/components/AnonymizeDialog.vue";
import PassphraseInput from "renderer/components/shared/PassphraseInput.vue";
import WaitOverlay from "renderer/components/shared/WaitOverlay.vue";

export default {
    name: "AwaitingAnonymizationHeader",

    components: {
        Popup,
        AnonymizeDialog,
        PassphraseInput,
        WaitOverlay
    },

    data() {
        return {
            showAnonymizeDialog: false,
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
            pendingConversion: 'Balance/pendingConversion'
        }),

        toAnonymize() {
            return this.availablePublic + this.pendingConversion;
        },

        nTokensNeedingAnonymization() {
            if (!this.enableElysium) return 0;
            return this.tokensNeedingAnonymization.map(x=>x[0]).sort().reduce((a, x) => a[a.length-1] == x ? a : [...a, x], []).length;
        }
    },

    methods: {
        bigintToString
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/warning-header";
</style>