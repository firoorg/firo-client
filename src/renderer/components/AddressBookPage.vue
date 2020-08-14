<template>
    <section class="addressbook-page">
        <div class="window-height addressbook-page-window">
            <section
                v-scrollable
                class="addressbook-container"
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
    name: 'AddressBookPage',

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
    .addressbook-page {
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

    .addressbook-container {
        padding: emRhythm(5) emRhythm(4);
        box-sizing: border-box;
        height: 100%;
    }

    .addressbook-page-window{
        position: relative
    }
</style>
