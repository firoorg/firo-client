<template>
    <div class="content-wrapper">
        <div>
            <h3>ERROR</h3>

            <p>
                {{ errorMessage }}
            </p>
        </div>
    </div>
</template>

<script>
export default {
    name: "SendStepError",

    props: {
        errorMessage: {
            type: String,
            required: true
        }
    }
}
</script>

<style scoped>
</style>