<template>
    <div id="payment-pending-warning">
        <h3>
            {{ convertToCoin(availablePublic) }} FIRO awaiting anonymization.
            <a href="#" @click="showAnonymizeDialog = true">Click here</a> to secure them.
        </h3>

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
import Popup from "renderer/components/Popup";
import AnonymizeDialog from "renderer/components/AnonymizeDialog";

export default {
    name: "PaymentPendingWarning",

    components: {
        Popup,
        AnonymizeDialog
    },

    data() {
        return {
            showAnonymizeDialog: false
        };
    },

    computed: mapGetters({
        availablePublic: 'Balance/availablePublic'
    }),

    methods: {
        convertToCoin,

        anonymizeFunds() {
            this. true;
        },

        closeDialog() {
            this.showAnonymizeDialog = false;
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/colors";
@import "src/renderer/styles/sizes";
@import "src/renderer/styles/popup";

#payment-pending-warning {
    user-select: none;
    height: 100%;
    background: $color-warning-background;
    color: $color-warning-text;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
</style>