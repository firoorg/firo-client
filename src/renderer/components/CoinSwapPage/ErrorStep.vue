<template>
    <div class="error-step">
        <div class="title">Error</div>

        <div class="content">
            {{ error }}
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
    name: "SendStepError",

    props: {
        error: {
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
    @include error();
}
</style>
