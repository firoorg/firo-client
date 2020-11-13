<template>
    <div id="main-layout">
        <PaymentPendingWarning v-if="showPaymentPendingWarning" />

        <div id="main-content" :class="{'has-payment-pending-warning': showPaymentPendingWarning}">
            <Sidebar id="sidebar" />

            <main ref="main" id="primary">
                <router-view />
            </main>
        </div>
    </div>
</template>

<script>
import {mapGetters} from "vuex";
import Sidebar from 'renderer/components/Sidebar'
import PaymentPendingWarning from "renderer/components/PaymentPendingWarning";

export default {
    name: 'MainLayout',

    components: {
        Sidebar,
        PaymentPendingWarning
    },

    computed: mapGetters({
        showPaymentPendingWarning: 'App/showPaymentPendingWarning'
    })
}
</script>

<style lang="scss">
@import "src/renderer/styles/colors";
@import "src/renderer/styles/sizes";

#main-layout {
    height: 100vh;

    #payment-pending-warning {
        height: $size-warning-banner;
    }

    #main-content {
        &:not(.has-payment-pending-warning) {
            height: 100vh;
        }

        &.has-payment-pending-warning {
            height: calc(100vh - #{$size-warning-banner});
        }

        #sidebar {
            float: left;
            width: $size-sidebar-width;
            height: 100%;
            background: $color-menu-background;
        }

        #primary {
            float: right;
            width: calc(100vw - #{$size-sidebar-width});
            height: 100%;
            background: $color-main-background;
        }
    }
}
</style>
