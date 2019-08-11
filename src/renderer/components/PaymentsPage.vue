<template>
    <section class="tx-page">
        <div class="window-height">
            <section
                v-scrollable
                class="payment-list-container"
            >
                <payments-list />
            </section>
        </div>

        <section class="tx-page-sidebar">
            <router-view />
        </section>
    </section>
</template>

<script>
import PaymentsList from '@/components/PaymentsList';

export default {
    name: 'PaymentsPage',

    components: {
        PaymentsList
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
</style>
