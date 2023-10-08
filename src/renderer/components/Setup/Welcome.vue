<template>
    <div class="welcome info-popup">
        <div class="title">Welcome!</div>

        <div class="content">
            Thank you for downloading <span class="firo">Firo</span>. Click below to embark on your path to financial privacy.
        </div>

        <div class="buttons">
            <button class="solid-button recommended" @click="next">
                Let's Go
            </button>
        </div>
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
    font-weight: var(--font-weight-bold);

    .content {
        min-width: 250px !important;
        width: 250px;

        .firo {
            color: var(--color-primary);
        }
    }
}
</style>
