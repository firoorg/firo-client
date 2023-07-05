<template>
    <div class="info-popup confirm-step" style="width: 500px; height: 250px;">
        <div class="title" style="margin-bottom:30px">
            Make this a private transaction
        </div>
        <div class="info-item">
            <FiroInfo class="info-icon" />
            <label>
                You are using a transparent transaction, please go private. If this is a masternode transaction, you do not have to go private
            </label>
        </div>

        <div class="buttons"  style="width: 500px; height: 60px;margin-top: 35px;margin-left: -15px">
            <button class="solid-button unrecommended" @click="$emit('ignore')">Ignore</button>
            <button class="solid-button recommended" @click="$emit('go_private')">Go Private</button>
        </div>
    </div>
</template>

<script>
import FiroInfo from 'renderer/assets/FiroInfo';

export default {
    name: 'GoPrivate',

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
.info-item {
    word-wrap: break-word;
    background-color: #FEF3C7;
    width: 500px;
    height: 65px;
    text-align: left;
    padding: 20px;
    margin-left: -15px;
    color: #92400E;
    display: flex;

    .info-icon {
        height: 28px;
        width: 28px;
        margin-right: 5px;
        margin-top: -8px;
    }

}
</style>
