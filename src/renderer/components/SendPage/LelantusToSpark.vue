<template>
    <div class="info-popup confirm-step" style="width: 500px; height: 250px;">
        <div class="title" style="margin-bottom:30px">
            Migrate funds from Lelantus to Spark
        </div>
        <div class="info">
            <Info class="info-icon info-item" />
            <label class="info-item">
                Firo is migrating to Spark. Please migrate your funds.
            </label>
        </div>

        <div class="buttons"  style="width: 500px; height: 60px;margin-top: 35px;margin-left: -15px">
            <button class="solid-button unrecommended" @click="$emit('ignore')">Ignore</button>
            <button class="solid-button recommended" @click="$emit('migrate')">Migrate</button>
        </div>
    </div>
</template>

<script>
import Info from "renderer/assets/Info.svg";

export default {
    name: 'LelantusToSpark',

    components: {
        Info
    },

    props: {
        label: String
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/info-popup";
.info {
    word-wrap: break-word;
    background-color: #FEF3C7;
    width: 500px;
    height: 65px;
    text-align: left;
    padding: 20px;
    margin-left: -15px;
    color: #92400E;
    display: flex;
    align-items: center;
}
    .info-item {
        margin-right: 45px;
    }

    .info-icon {
        height: 18px;
        width: 18px;
        margin-left: 40px;
        margin-right: 5px;
        margin-top: -4px;
    }
</style>
