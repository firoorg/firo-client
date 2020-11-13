<template>
    <div class="error-step">
        <div class="title">Success!</div>

        <div class="content">
            {{ message }}
        </div>

        <div class="buttons">
            <button @click="$emit('ok')">
                Ok
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: "SuccessMessage",

    props: {
        message: {
            type: String,
            required: true
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/typography";
@import "src/renderer/styles/popup";

@include popup();

.content {
    @include guidance();
}
</style>
