<template>
    <form @submit.prevent="next">
        <div class="warning">
            <div>
                <h1>{{ $t('onboarding.final-passphrase-confirmation.title') }}</h1>

                <div class="content">
                    <p v-html="$t('onboarding.final-passphrase-confirmation.warning__loose-coins')" />
                </div>
            </div>

            <footer class="footer">
                <base-button
                    is-outline
                    type="button"
                    @click="prev"
                >
                    {{ $t('onboarding.final-passphrase-confirmation.button__create-other-passphrase--secondary') }}
                </base-button>
                <base-button
                    v-focus
                    color="white"
                    type="submit"
                >
                    {{ $t('onboarding.final-passphrase-confirmation.button__confirm-passphrase--primary') }}
                </base-button>
            </footer>
        </div>
    </form>
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
    color: $color--white;
    padding: emRhythm(5);
    margin: emRhythm(-5);
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .icon {
        width: emRhythm(20, $ms-up1);
        margin-right: emRhythm(2);
    }

    .content {
        @include setType(3, $ms-up1);
        @include font-heavy();

        margin-bottom: emRhythm(3);
    }

    p:last-of-type {
        margin-bottom: 0;
    }
}
</style>
