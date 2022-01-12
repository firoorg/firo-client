<template>
    <div>
        <WaitOverlay v-if="waiting" />
        <PassphraseInput v-else v-model="passphrase" :error="error" @cancel="cancel()" @confirm="tryAnonymize()" />
    </div>
</template>

<script>
import {convertToCoin} from "lib/convert";
import {mapGetters} from "vuex";
import WaitOverlay from "renderer/components/shared/WaitOverlay";
import {IncorrectPassphrase, FirodErrorResponse} from "daemon/firod";
import Amount from "renderer/components/shared/Amount";
import PassphraseInput from "renderer/components/shared/PassphraseInput";

export default {
    name: "AnonymizeDialog",

    components: {
        Amount,
        PassphraseInput,
        WaitOverlay
    },

    data() {
        return {
            error: null,
            passphrase: '',
            waiting: false
        };
    },

    computed: mapGetters({
        availablePublic: 'Balance/availablePublic',
        tokensNeedingAnonymization: 'Elysium/tokensNeedingAnonymization'
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

            try {
                const r = await $daemon.mintAllLelantus(passphrase);
                $store.commit('Transactions/markSpentTransaction', r.inputs);
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

            const elysiumErrors = [];
            for (const [token, address] of this.tokensNeedingAnonymization) {
                try {
                    await $daemon.mintElysium(passphrase, address, token);
                } catch (e) {
                    if (e instanceof FirodErrorResponse) {
                        elysiumErrors.push(e.errorMessage);
                    } else {
                        elysiumErrors.push(`${e}`);
                    }
                }
            }
            console.log(elysiumErrors);
            if (elysiumErrors.length) {
                this.error = JSON.stringify(elysiumErrors);
                this.waiting = false;
                return;
            }

            this.waiting = false;
            this.$emit('complete');
        }
    }
}
</script>

<style scoped lang="scss">

</style>