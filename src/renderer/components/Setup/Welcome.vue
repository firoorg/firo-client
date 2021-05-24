<template>
    <div class="welcome">
        <div class="title">Welcome!</div>

        <div class="content">
            Thank you for downloading <span class="firo">Firo</span>. Click below to embark on your path to financial privacy.
        </div>

        <div class="buttons">
            <button @click="next">
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
@import "src/renderer/styles/popup";
@import "src/renderer/styles/colors";

.welcome {
    @include popup();
    max-width: 30% !important;
    text-align: center;

    .content {
        .firo {
            color: var(--color-text-accent);
        }
    }

    .buttons {
        width: 30%;
    }
}
</style>
