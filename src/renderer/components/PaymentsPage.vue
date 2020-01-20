<template>
    <section class="tx-page">
        <div class="window-height payment-page-window">
            <section
                v-scrollable
                class="payment-list-container"
            >
                <payments-list />
            </section>
            <section
                v-scrollable
                class="overlay centered"
            >
                <custom-input-popup />
            </section>
        </div>

        <section class="tx-page-sidebar">
            <router-view />
        </section>
    </section>
</template>

<script>
import PaymentsList from '@/components/PaymentsList';
import CustomInputPopup from '@/components/Overlay/CustomInputPopup';

export default {
    name: 'PaymentsPage',

    components: {
        PaymentsList,
        CustomInputPopup
    }
}
</script>

<style lang="scss" scoped>
    .tx-page {
        display: grid;
        box-sizing: border-box;
        grid-template-columns: 1fr $detail-view--min-width;

        .scrollable {
            position: relative;
            z-index: 1;
            box-sizing: border-box;
            overflow: scroll;
            height: 100vh;
        }
    }

    .payment-list-container,
    .tx-page-sidebar {
        position: relative;
    }

    .payment-list-container {
        padding: emRhythm(5) emRhythm(4);
        box-sizing: border-box;
        height: 100%;
    }

    .tx-page-sidebar {
        background: $color--white;
    }
    .payment-page-window{
        position: relative
    }
</style>
