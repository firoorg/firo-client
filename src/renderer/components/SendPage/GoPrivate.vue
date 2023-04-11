<template>
    <div class="info-popup confirm-step" style="width: 500px; height: 250px;">
        <div class="title" style="margin-bottom:30px">
            <!-- Confirm {{ isPrivate ? '' : 'Public '}}Send -->
            Make this a private transaction
        </div>
        <div style="width: 500px;height: 65px; word-wrap: break-word; background-color: #FEF3C7; text-align: left;padding: 20px;margin-left: -15px; color: #92400E;">
            You are using a transparent transaction, please go private. If this is a masternode transaction, you do not have to go private
        </div>
        <div class="buttons"  style="width: 500px; height: 60px;margin-top: 35px;margin-left: -15px">
            <button class="solid-button unrecommended" @click="$emit('ignore')">Ignore</button>
            <button class="solid-button recommended" @click="$emit('go_private')">Go Private</button>
        </div>
    </div>
</template>

<script>
// $emits: cancel, confirm

export default {
    name: 'GoPrivate',

    components: {
    },

    props: {
        isPrivate: Boolean,
        label: String
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/info-popup";
</style>
