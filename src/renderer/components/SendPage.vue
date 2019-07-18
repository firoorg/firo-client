<template>
    <section class="outgoing-payments">
        <div class="window-height">
            <section
                v-scrollable
                class="outgoing-requests-list"
            >
                <outgoing-payments-list />
            </section>
        </div>

        <section class="paymentrequest-detail">
            <send />
        </section>
    </section>
</template>

<script>
import OutgoingPaymentsList from '@/components/SendPage/OutgoingPaymentsList';
import Send from '@/components/SendPage/Send';

export default {
    name: 'SendPage',

    components: {
        OutgoingPaymentsList,
        Send
    }
}
</script>

<style lang="scss" scoped>
    .outgoing-payments {
        display: grid;
        box-sizing: border-box;
        grid-template-columns: 1fr $detail-view--min-width;
        //grid-column-gap: emRhythm(5);

        .scrollable {
            position: relative;
            z-index: 1;
            box-sizing: border-box;
            overflow: scroll;
            height: 100vh;
        }
    }

    .outgoing-requests-list,
    .paymentrequest-detail {
        position: relative;
    }

    .outgoing-requests-list {
        padding: emRhythm(5) emRhythm(4);
        box-sizing: border-box;
        height: 100%;
    }

    .paymentrequest-detail {
        //background: $gradient--comet-dark-horizontal;
        //background: $gradient--polo-horizontal;
        background: $color--white;
    }

    .create-wrap {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        width: 100%;

        .create-payment-request {
            width: 100%;
        }
    }
</style>
