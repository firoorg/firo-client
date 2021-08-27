<template>
    <div class="info-popup passphrase-input change-passphrase-popup">
        <div v-if="success" class="title">Success!</div>
        <div v-else class="title">Change Your Passphrase</div>

        <div v-if="success" class="content">Your passphrase has been changed.</div>
        <div v-else class="content">
            <input v-focus id="current-passphrase" type="password" placeholder="Enter Your Passphrase" v-model="currentPassphrase" @keyup.enter="changePassphrase" />
            <input id="new-passphrase" type="password" placeholder="Enter Your New Passphrase" v-model="newPassphrase" @keyup.enter="changePassphrase" />
            <input id="confirm-new-passphrase" type="password" placeholder="Confirm Your Passphrase" v-model="confirmNewPassphrase" @keyup.enter="changePassphrase" />
            <div v-if="error" class="error">{{ error }}</div>
        </div>

        <div v-if="success" class="buttons">
            <button id="ok-button" class="solid-button recommended" @click="ok">OK</button>
        </div>
        <div v-else class="buttons">
            <button id="cancel-button" class="solid-button unrecommended" @click="cancel">
                Cancel
            </button>

            <button id="confirm-button" class="solid-button recommended" :disabled="!canChangePassphrase" @click="changePassphrase">
                Confirm
            </button>
        </div>
    </div>
</template>

<script>
import {IncorrectPassphrase} from "daemon/firod";

export default {
    name: "ChangePassphrasePopup",

    data() {
        return {
            currentPassphrase: '',
            newPassphrase: '',
            confirmNewPassphrase: '',
            success: false,
            error: null
        };
    },

    computed: {
        canChangePassphrase() {
            return this.currentPassphrase && this.newPassphrase && this.newPassphrase === this.confirmNewPassphrase;
        }
    },

    methods: {
        async changePassphrase() {
            if (!this.canChangePassphrase) return;

            try {
                await $daemon.setPassphrase(this.currentPassphrase, this.newPassphrase);
                this.newPassphrase = '';
                this.confirmNewPassphrase = '';
                this.success = true;
            } catch (e) {
                this.newPassphrase = '';
                this.confirmNewPassphrase = '';
                if (e instanceof IncorrectPassphrase) {
                    this.error = 'Incorrect Passphrase';
                } else {
                    this.error = `${e && e.message ? e.message : e}`;
                }
            }

            this.currentPassphrase = '';
        },

        ok() {
            this.newPassphrase = '';
            this.confirmNewPassphrase = '';
            this.success = false;
            this.$emit('ok');
        },

        cancel() {
            this.newPassphrase = '';
            this.confirmNewPassphrase = '';
            this.$emit('cancel');
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/info-popup";
@import "src/renderer/styles/passphrase-input";

.change-passphrase-popup {
    input[type="password"]:not(:first-child) {
        margin-top: var(--padding-base);
    }
}
</style>