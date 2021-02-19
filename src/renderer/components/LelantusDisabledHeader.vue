<template>
    <div class="warning-header">
        <span>
            Lelantus has been disabled. See <a href="#" @click="openTwitter">@firoorg on Twitter</a> for more
            information.
        </span>
    </div>
</template>

<script>
import {shell} from 'electron';

export default {
    name: "LelantusDisabledHeader",

    methods: {
        openTwitter() {
            shell.openExternal('https://twitter.com/firoorg');
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/warning-header";
</style>