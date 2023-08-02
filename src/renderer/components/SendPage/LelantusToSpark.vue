<template>
    <div class="info-popup confirm-step lelantustospark-popup">
        <div class="title lelantustospark-title">
            Migrate funds from Lelantus to Spark
        </div>
        <div class="info">
            <FiroInfo class="info-icon info-item" />
            <label class="info-item">
                Firo is migrating to Spark. Please migrate your funds.
            </label>
        </div>
        <div class="lelantustospark-buttons">
            <button class="solid-button unrecommended" @click="$emit('ignore')">Ignore</button>
            <button class="solid-button recommended" @click="$emit('migrate')">Migrate</button>
        </div>
    </div>
</template>

<script>
import FiroInfo from 'renderer/assets/FiroInfo';

export default {
    name: 'LelantusToSpark',

    components: {
        FiroInfo
    },

    props: {
        label: String
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/info-popup";

.lelantustospark-popup {
    width: 500px;
    height: 250px;
}

.lelantustospark-title {
    margin-bottom: 30px;
}

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

.lelantustospark-buttons {
    width: 500px !important;
    height: 60px;
    display: flex;
    justify-content: space-evenly;
    margin-top: 35px;
    margin-left: -15px;
}
</style>
