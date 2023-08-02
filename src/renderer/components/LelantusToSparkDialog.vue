<template>
    <div>
        <div>
            <WaitOverlay v-if="waiting" />
            <LelantusToSpark v-else :error="error" @ignore="cancel()" @migrate="goToPassphraseStep()" />
        </div>

        <Popup v-if="show === 'passphrase'" >
            <WaitOverlay v-if="waiting" />
            <PassphraseInput v-else v-model="passphrase" :error="error" @cancel="cancel()" @confirm="tryMigrate()" />
        </Popup>
    </div>
</template>

<script>

import LelantusToSpark from "renderer/components/SendPage/LelantusToSpark";
import PassphraseInput from "renderer/components/shared/PassphraseInput";
import WaitOverlay from "renderer/components/shared/WaitOverlay";
import Popup from "renderer/components/shared/Popup";

export default {
    name: 'LelantusToSparkDialog',

    components: {
        LelantusToSpark,
        WaitOverlay,
        PassphraseInput,
        Popup
    },

    data() {
        return {
            error: null,
            passphrase: '',
            waiting: false,
            show: 'button',
        };
    },

    methods: {
        cancel() {
            this.passphrase = '';
            this.error = null;
            this.show = 'button';
            this.$emit('ignore')
        },

        goToPassphraseStep() {
            this.show = 'passphrase';
        },

        async tryMigrate() {
            const passphrase = this.passphrase;
            this.passphrase = '';
            this.waiting = true;
            try {
                await $daemon.lelantusToSpark(passphrase);
            } catch (e) {
                if (e instanceof IncorrectPassphrase) {
                    this.error = 'Incorrect Passphrase';
                } else if (e instanceof FirodErrorResponse) {
                    this.error = e.errorMessage;
                } else {
                    this.error = `${e}`;
                }
                this.waiting = false;
                this.show = 'passphrase';
                return;
            }
            this.error = null;
            this.waiting = false;
            this.show = 'button';
            this.$emit('success');
        }
    }
}
</script>

<style scoped lang="scss">

</style>
