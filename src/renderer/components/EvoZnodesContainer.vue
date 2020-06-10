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
