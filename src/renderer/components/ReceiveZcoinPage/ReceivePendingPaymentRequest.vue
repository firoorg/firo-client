<template>
    <div class="is-pending">
        <div class="message-wrap">
            <h3>{{ $t('receive.detail-entry-request.title__message') }}</h3>
            <div v-html="messageFormatted" />
        </div>
    </div>
</template>

<script>
    import { nl2br } from '@/utils/format'

    export default {
        name: 'ReceivePendingPaymentRequest',

        props: [
            'message'
        ],

        computed: {
            messageFormatted () {
                return nl2br(this.message)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .is-pending {
        display: grid;
        grid-template-rows: 1fr auto;

        .message-wrap {
            margin-left: emRhythm(3);
        }
    }
</style>
