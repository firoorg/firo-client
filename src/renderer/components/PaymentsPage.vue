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
                v-if="isShowingCustomInputs"
                class="overlay centered"
            >
                <custom-input-popup />
            </section>

            <section
                v-if="openAddressBook != null && openAddressBook.open"
                class="overlay centered"
            >
                <address-book-popup />
            </section>

            <WarningWalletWithoutMnemonics v-if="apiStatus.data && !apiStatus.data.hasMnemonic && apiStatus.data.shouldShowWarning && showWarning" @close-mnemonic-warning="closeMnemonicWarning"/>
        </div>

        <section class="tx-page-sidebar">
            <router-view />
        </section>
    </section>
</template>


<script>
import { mapGetters } from 'vuex';
import PaymentsList from '@/components/PaymentsList';
import CustomInputPopup from '@/components/Overlay/CustomInputPopup';
import AddressBookPopup from '@/components/Overlay/AddressBookPopup';
import WarningWalletWithoutMnemonics from './Mnemonics/WarningWalletWithoutMnemonics.vue';

export default {
    name: 'PaymentsPage',

    components: {
        PaymentsList,
        CustomInputPopup,
        WarningWalletWithoutMnemonics,
        AddressBookPopup
    },
    data() {
        return {
            data: ''
        }
    },
    mounted() {
        this.$on('close-mnemonic-warning', this.closeMnemonicWarning);
    },
    computed: {
        ...mapGetters({
            isShowingCustomInputs: 'ZcoinPayment/customInputs',
            hasApiStatus: 'ApiStatus/hasApiStatus',
            apiStatus: 'ApiStatus/apiStatus',
            showWarning: 'Settings/showWarning',
            openAddressBook: 'App/openAddressBook'
        }),
    },

    methods: {
        async closeMnemonicWarning() {
            this.$store.commit('Settings/MNEMONIC_WARNING_SETTING', false);
        }
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
