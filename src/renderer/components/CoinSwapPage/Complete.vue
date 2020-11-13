<template>
    <div class="content-wrapper">
        <div>
            {{ message }}
        </div>
    </div>
</template>

<script>
export default {
    name: "SendStepComplete",

    props: {
        message: {
            type: String,
            default: "Your transaction was successful!"
        }
    }
}
</script>

<style scoped>
</style>
