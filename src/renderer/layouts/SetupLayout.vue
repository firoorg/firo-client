<template>
    <div id="setup-layout">
        <div id="logo">
            <ZcoinLogo />
        </div>

        <router-view id="setup-child" />
    </div>
</template>

<script>
import ZcoinLogo from '@/components/Icons/ZcoinLogo';

export default {
    name: "SetupLayout",

    components: {
        ZcoinLogo
    }
}
</script>

<style scoped lang="scss">
#setup-layout {
    background-color: $color--comet-dark;
    height: 100%;
    width: 100%;
    position: fixed;
    left: 0;
    top: 0;

    #logo {
        height: emRhythm(13);
        width: emRhythm(13);
        margin: {
            left: auto;
            right: auto;
            top: emRhythm(5);
        };
    }

    #setup-child {
        background-color: $color--comet-light;
        padding: 2em;
        border-radius: 2em;
        max-width: 90%;
        height: fit-content;
        margin: {
            left: auto;
            right: auto;
            top: emRhythm(5);
        };
    }
}
</style>