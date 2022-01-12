<template>
    <div>
        <div class="warning-header">
            <div>
                <span v-if="availablePublic && nTokensNeedingAnonymization > 1">
                    {{ convertToCoin(availablePublic) }} FIRO and {{ nTokensNeedingAnonymization }} Elysium tokens
                    awaiting anonymization.
                </span>
                <span v-else-if="availablePublic && nTokensNeedingAnonymization">
                    {{ convertToCoin(availablePublic) }} FIRO and 1 Elysium token awaiting anonymization.
                </span>
                <span v-else-if="nTokensNeedingAnonymization > 1">
                    {{ nTokensNeedingAnonymization }} Elysium tokens awaiting anonymization.
                </span>
                <span v-else-if="nTokensNeedingAnonymization">
                    1 Elysium token awaiting anonymization.
                </span>
                <span v-else-if="availablePublic">
                    {{ convertToCoin(availablePublic) }} FIRO awaiting anonymization.
                </span>
                <a id="anonymize-firo-link" href="#" @click="showAnonymizeDialog = true">Click here</a> to secure
                {{ nTokensNeedingAnonymization > 1 || availablePublic ? "them" : "it" }}.
            </div>
        </div>

        <Popup v-if="showAnonymizeDialog">
            <AnonymizeDialog
                @cancel="showAnonymizeDialog = false"
                @complete="showAnonymizeDialog = false"
            />
        </Popup>
    </div>
</template>

<script>
import {mapGetters} from "vuex";
import {convertToCoin} from "lib/convert";
import Popup from "renderer/components/shared/Popup";
import AnonymizeDialog from "renderer/components/AnonymizeDialog";

export default {
    name: "AwaitingAnonymizationHeader",

    components: {
        Popup,
        AnonymizeDialog
    },

    data() {
        return {
            showAnonymizeDialog: false
        };
    },

    computed: {
        ...mapGetters({
            availablePublic: 'Balance/availablePublic',
            enableElysium: 'App/enableElysium',
            tokensNeedingAnonymization: 'Elysium/tokensNeedingAnonymization'
        }),

        nTokensNeedingAnonymization() {
            if (!this.enableElysium) return 0;
            return this.tokensNeedingAnonymization.map(x=>x[0]).sort().reduce((a, x) => a[a.length-1] == x ? a : [...a, x], []).length;
        }
    },

    methods: {
        convertToCoin,

        closeDialog() {
            this.showAnonymizeDialog = false;
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/warning-header";
</style>