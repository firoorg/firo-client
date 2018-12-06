<template>
    <ul>
        <li>
            <strong class="connections-badge">
                {{ connections }}
            </strong> Connections
        </li>
        <li>(Yes/No) Tor</li>
        <li>(Yes) Dandelion</li>
    </ul>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'BlockchainConnectionPopover',
    computed: {
        ...mapGetters({
            connections: 'Blockchain/connections'
        })
    }
}
</script>

<style lang="scss" scoped>
    ul {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    li + li {
        padding-top: emRhythm(1);
    }
</style>
