<template>
    <section class="connectivity-overlay overlay centered">
        <div class="grid">
            <main class="content">
                <header>
                    <warning
                        class="status"
                        :has-shadow="true"
                    />
                    <h1 v-html="$t('overlay.error.connection-lost.title')" />
                </header>

                <p v-html="$t('overlay.error.connection-lost.description')" />

                <footer>
                    <base-button
                        color="red"
                        is-dark
                        @click="closeApp"
                    >
                        {{ $t('overlay.error.connection-lost.button__quit--secondary') }}
                    </base-button>
                    <base-button
                        is-dark
                        @click="restartDaemon"
                    >
                        {{ $t('overlay.error.connection-lost.button__restart-daemon--primary') }}
                    </base-button>
                </footer>
            </main>
        </div>
    </section>
</template>

<script>
import types from '~/types'

import { remote } from 'electron'
import { mapActions } from 'vuex'

import Warning from '@/components/Icons/Warning'

export default {
    name: 'ConnectivityOverlay',
    components: {
        Warning
    },
    methods: {
        ...mapActions({
            restartDaemon: types.app.DAEMON_RESTART
        }),

        closeApp () {
            remote.app.quit()
        }
    }
}
</script>

<style lang="scss" scoped>
    .connectivity-overlay {
    }

    .status {
        text-align: center;
        font-size: emRhythm(20);
        color: $color--polo-medium;
        display: inline-block;
    }
</style>
