<template>
    <div id="app" :class="`${colorTheme}-color-theme`">
        <div id="app-drag-area" />

        <div v-if="unlockRequested">
            <PassphraseRequestOverlay />
        </div>

        <div v-else-if='waitingReason'>
            <WaitingScreen v-if='waitingReason' :reason='waitingReason' />
        </div>

        <div v-else>
            <router-view />
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import WaitingScreen from "renderer/components/WaitingScreen";
import PassphraseRequestOverlay from "./components/shared/PassphraseRequestOverlay.vue";

export default {
    name: 'FiroClient',

    components: {
        WaitingScreen,
        PassphraseRequestOverlay
    },

    computed: mapGetters({
        waitingReason: 'App/waitingReason',
        colorTheme: 'App/colorTheme',
        unlockRequested: 'ApiStatus/unlockRequested'
    }),


}
</script>

<style lang="scss">
@import "./styles/main";

#app {
    position: fixed;
    user-select: none;

    #app-drag-area {
        position: absolute;
        top: 0;
        z-index: var(--z-app-drag-area);
        height: 16px;
        width: 100vw;

        // Allow the user to drag the window from this area.
        user-select: none;
        -webkit-app-region: drag;
    }
}
</style>
