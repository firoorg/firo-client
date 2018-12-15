<template>
    <div class="restarting">
        <loading-bounce />
        <main>
            <h2>{{ $t('onboarding.passphrase-daemon-restart.title') }}</h2>
            <p v-html="$t('onboarding.passphrase-daemon-restart.description')" />
        </main>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import GuideStepMixin from '@/mixins/GuideStepMixin'
import LoadingBounce from '@/components/Icons/LoadingBounce'

export default {
    name: 'IntroScreenRestartingDaemon',
    components: {
        LoadingBounce
    },

    mixins: [
        GuideStepMixin
    ],

    computed: {
        ...mapGetters({
            isLocked: 'App/isLocked'
        })
    },

    watch: {
        isLocked(newVal) {
            if (newVal) {
                this.actions.next()
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.restarting {
    display: flex;
    align-items: center;
    padding-bottom: emRhythm(1);

    main {
        margin-left: emRhythm(3);
    }

    h2 {
        margin: 0 0 emRhythm(2, $ms-up2);
    }

    p:last-of-type {
        margin-bottom: 0;
    }
}
</style>
