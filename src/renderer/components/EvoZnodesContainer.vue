<template>
    <section class="znode-page">
        <div class="window-height">
            <section
                v-scrollable
                class="znode-list-container"
            >
                <EvoZnodesPage />
            </section>
        </div>
    </section>
</template>


<script>
import { mapGetters } from 'vuex';
import EvoZnodesPage from '@/components/EvoZnodesPage';

export default {
    name: 'EvoZnodesContainer',

    components: {
        EvoZnodesPage
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
    .znode-page {
        display: grid;
        box-sizing: border-box;
        right: 2%;
        .scrollable {
            position: relative;
            z-index: 1;
            box-sizing: border-box;
            overflow: scroll;
            height: 100vh;
        }
    }

    .znode-list-container {
        padding: emRhythm(5) emRhythm(4);
        box-sizing: border-box;
        height: 100%;
    }

    .payment-page-window {
        position: relative
    }
</style>
