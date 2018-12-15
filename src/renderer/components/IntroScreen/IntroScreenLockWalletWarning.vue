<template>
    <div>
        <div class="warning">
            <h1>{{ $t('onboarding.final-passphrase-confirmation.title') }}</h1>

            <div class="content">
                <p v-html="$t('onboarding.final-passphrase-confirmation.warning__loose-coins')" />
                <p v-html="$t('onboarding.final-passphrase-confirmation.description')" />
            </div>

            <footer class="footer">
                <base-button
                    color=""
                    is-outline
                    @click="prev"
                >
                    {{ $t('onboarding.final-passphrase-confirmation.button__create-other-passphrase--secondary') }}
                </base-button>
                <base-button
                    color="white"
                    @click="next"
                >
                    {{ $t('onboarding.final-passphrase-confirmation.button__confirm-passphrase--primary') }}
                </base-button>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    name: "IntroScreenLockWalletWarning",

    props: {
        prev: {
            type: Function,
            required: true
        },
        next: {
            type: Function,
            required: true
        }
    }
}
</script>

<style lang="scss" scoped>
.warning {
    background: $color--orange;
    color: $color--dark;
    padding: emRhythm(4) emRhythm(4) emRhythm(6);
    margin: emRhythm(-4) emRhythm(-4);

    .icon {
        width: emRhythm(20, $ms-up1);
        margin-right: emRhythm(2);
    }

    .content {
        @include setType(3, $ms-up1);
        margin-bottom: emRhythm(3);
    }

    p:last-of-type {
        margin-bottom: 0;
    }
}
</style>
