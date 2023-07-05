<template>
    <div class="warning-header">
        <div>
            Lelantus has been disabled. See <a @click="openTwitter">@firoorg on Twitter</a> for more
            information.
        </div>
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