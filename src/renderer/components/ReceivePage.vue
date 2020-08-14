<template>
    <section class="receive-page">
        <div class="window-height receive-page-window">
            <section
                v-scrollable
                class="receive-page-container"
            >
                <receive-list />
            </section>
        </div>
    </section>
</template>


<script>
import { mapGetters } from 'vuex';
import ReceiveList from '@/components/ReceiveList';

export default {
    name: 'ReceivePage',

    components: {
        ReceiveList,
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
    .receive-page {
        display: grid;
        box-sizing: border-box;

        .scrollable {
            position: relative;
            z-index: 1;
            box-sizing: border-box;
            overflow: scroll;
            height: 100vh;
        }
    }

    .receive-page-container {
        padding: emRhythm(5) emRhythm(4);
        box-sizing: border-box;
        height: 100%;
    }

    .receive-page-window{
        position: relative
    }
</style>
