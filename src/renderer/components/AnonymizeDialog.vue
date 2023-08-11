<template>
    <div>
        <WaitOverlay v-if="waiting" />
        <PassphraseInput v-else v-model="passphrase" :error="error" @cancel="cancel()" @confirm="tryAnonymize()" />
    </div>
</template>

<script>
import {mapGetters} from "vuex";
import WaitOverlay from "renderer/components/shared/WaitOverlay.vue";
import {IncorrectPassphrase, FirodErrorResponse} from "daemon/firod";
import Amount from "renderer/components/shared/Amount.vue";
import PassphraseInput from "renderer/components/shared/PassphraseInput.vue";

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

    computed: {
        ...mapGetters({
            availablePublic: 'Balance/availablePublic',
            tokensNeedingAnonymization: 'Elysium/tokensNeedingAnonymization',
            tokenData: 'Elysium/tokenData',
            isSparkAllowed: 'ApiStatus/isSparkAllowed'
        })
    },

    methods: {
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

            const errors = [];

            for (const [token, address] of this.tokensNeedingAnonymization) {
                try {
                    const id = this.tokenData[token].id;
                    await $daemon.mintElysium(passphrase, address, id);
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

            try {
                if(this.isSparkAllowed) {
                    await $daemon.mintAllSpark(passphrase);
                } else {
                    await $daemon.mintAllLelantus(passphrase);
                }
            } catch (e) {
                if (e instanceof FirodErrorResponse) {
                    errors.unshift(e.errorMessage);
                } else {
                    errors.unshift(`${e}`);
                }
            }

            this.waiting = false;

            if (errors.length) this.error = JSON.stringify(errors);
            else this.$emit('complete');
        }
    }
}
</script>

<style scoped lang="scss">

</style>