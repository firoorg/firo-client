<template>
    <div id="app">
        <router-view />
    </div>
</template>

<script>
import {convertToCoin} from "#/lib/convert";
import {mapGetters} from 'vuex';

export default {
    name: 'ZcoinClient',

    computed: {
        ...mapGetters({
            zcoinLink: 'App/zcoinLink'
        })
    },

    watch: {
        // zcoinLink is updated when the user opens a zcoin:// URL. It's a pretty digusting way of doing it, but I all
        // the clean ones had some problem or another, and I couldn't figure out something clean.
        //
        // FIXME: Figure out how to do this in a way that isn't hideous.
        zcoinLink (url) {
            const m = (pattern) => (url.match(pattern) || [])[1];

            const address = m(/^zcoin:\/\/(\w+)/);
            const amount = m(/[\?&]amount=([0-9]+)/);
            const label = m(/[\?&]message=([^&]+)/);

            this.$router.push({
                path: '/send/private',
                query: {
                    address: address,
                    amount: amount && convertToCoin(amount),
                    label: decodeURI(label || '')
                }
            });
        }
    }
}
</script>

<style>
    @import '../../node_modules/lato-font/css/lato-font.css';
    @import '../../node_modules/typeface-overpass-mono/index.css';
</style>
