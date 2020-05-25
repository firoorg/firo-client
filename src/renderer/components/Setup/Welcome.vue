<template>
    <div class="welcome">
        <h1>Welcome!</h1>

        <p>
            Thank you for downloading the Zcoin Client! You have taken the first step towards financial privacy. Click
            the button below to begin setting up your client!
        </p>

        <BaseButton class="start-button" color="green" @click="next">
            {{ $t('onboarding.intro-screen.button__start--primary') }}
        </BaseButton>
    </div>
</template>

<script>

export default {
    name: 'Welcome',

    methods: {
        next() {
            this.$router.push("/setup/select-blockchain-location");
        }
    }
}
</script>

<style lang="scss" scoped>
.welcome {
    width: 50%;

    text-align: center;
    font-size: 1.2em;

    h1 {
        margin-bottom: emRhythm(1);
    }

    p {
        margin-bottom: emRhythm(2);
    }
}
</style>
