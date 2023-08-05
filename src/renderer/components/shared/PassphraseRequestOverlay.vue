<script setup lang='ts'>
import {ref} from 'vue';
import PassphraseInput from './PassphraseInput.vue';

const passphrase = ref('');
const error = ref('');

let confirming = false;
async function confirm() {
    if (confirming) return;
    confirming = true;

    $setWaitingReason("Unlocking wallet...");

    try {
        await $daemon.unlock(passphrase.value);
        error.value = '';
    } catch (e) {
        error.value = e.message;
    } finally {
        confirming = false;
        passphrase.value = '';
        $setWaitingReason(undefined);
    }
}
</script>

<template>
    <div class="passphrase-request-overlay">
        <PassphraseInput :no-cancel="true" :error="error" @confirm="confirm()" v-model="passphrase" />
    </div>
</template>

<style lang='scss'>
.passphrase-request-overlay {
    position: fixed;
    height: 100vh;
    width: 100vw;
    z-index: var(--z-waiting-screen);
    background-color: var(--color-background-detail);

    display: flex;
    flex-direction: column;
    justify-content: center;

    .passphrase-input {
        width: fit-content;
        margin: auto;
        border: {
            color: var(--color-text-subtle-border);
            radius: 6px;
            style: solid;
            width: 3px;
        }
    }
}
</style>