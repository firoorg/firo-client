<template>
    <section class="connectivity-overlay overlay centered">
        <div class="grid">
            <main class="content">
                <header>
                    <Warning
                        class="status"
                        :has-shadow="true"
                    />
                    <h1 v-html="$t('error.connection-lost.title')" />
                </header>

                <p v-html="$t('error.connection-lost.description')" />

                <footer>
                    <BaseButton
                        color="red"
                        is-dark
                        @click="closeApp"
                    >
                        {{ $t('error-connection-lost.button__quit--primary') }}
                    </BaseButton>
                    <!--<BaseButton>Restart Daemon</BaseButton>-->
                </footer>
            </main>
        </div>
    </section>
</template>

<script>
import { remote } from 'electron'
import Warning from '@/components/Icons/Warning'

export default {
    name: 'ConnectivityOverlay',
    components: {
        Warning
    },
    methods: {
        closeApp () {
            remote.app.quit()
        }
        // todo implement daemon restart.
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
