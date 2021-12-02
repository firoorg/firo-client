<template>
    <div class="info-popup create-token-form">
        <div class="title">Create Token</div>

        <div class="content">
            <div class="line">
                <input class="smooth-input" type="text" placeholder="Name">
                <input class="smooth-input" type="text" placeholder="Ticker">
            </div>

            <div class="line">
                <input class="smooth-input" type="text" placeholder="Category">
                <input class="smooth-input" type="text" placeholder="Subcategory">
            </div>

            <div class="line">
                <input class="smooth-input" type="text" placeholder="Issuance Amount">
                <div class="checkbox-container">
                    <div class="checkbox-field">
                        <input type="checkbox">
                        <label>Allow Fractional Sends</label>
                    </div>
                </div>
            </div>

            <textarea class="smooth-input" placeholder="Description" />

            <input class="url smooth-input" type="text" placeholder="URL" />
        </div>

        <div class="buttons">
            <button class="solid-button unrecommended" @click="$emit('cancel')">Cancel</button>
            <button class="solid-button recommended" @click="$emit('submit')">OK</button>
        </div>
    </div>
</template>

<script>
export default {
    name: "CreateTokenForm"
}
</script>

<style scoped lang="scss">
.create-token-form {
    .line {
        &:not(:first-child) {
            margin-top: var(--padding-base);
        }

        input[type="text"] {
            width: 200px;

            &:not(:last-child) {
                margin-right: var(--padding-base);
            }
        }

        .checkbox-container {
            display: inline-block;
            width: 200px;
            vertical-align: middle;
        }
    }

    textarea, .url {
        display: block;
        margin-top: var(--padding-base);
        width: calc(400px + var(--padding-base));
    }

    textarea {
        height: 80px;
        font-family: inherit;
    }
}
</style>