<template>
    <div class="warning-header">
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
@import "src/renderer/styles/warning-header";
</style>