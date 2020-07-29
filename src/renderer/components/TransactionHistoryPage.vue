<template>
    <section class="tx-history-page">
        <div class="window-height history-page-window">
            <section
                v-scrollable
                class="tx-history-list-container"
            >
                <transaction-list />
            </section>
        </div>
    </section>
</template>


<script>
import { mapGetters } from 'vuex';
import TransactionList from '@/components/TransactionList';

export default {
    name: 'TransactionHistoryPage',

    components: {
        TransactionList,
    },
    data() {
        return {
            data: ''
        }
    },

    computed: {
        ...mapGetters({

        }),
    },

    methods: {

    }
}
</script>

<style lang="scss" scoped>
    .tx-history-page {
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

    .tx-history-list-container {
        padding: emRhythm(5) emRhythm(4);
        box-sizing: border-box;
        height: 100%;
    }

    .history-page-window{
        position: relative
    }
</style>
