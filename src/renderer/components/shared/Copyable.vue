<template>
    <span v-bind="props"><span ref="content"><slot /></span><span class="nbsp">&nbsp;</span><a @click="copy">📋</a></span>
</template>

<script>
import {clipboard} from "electron";

export default {
    name: "Copyable",

    methods: {
        copy() {
            clipboard.writeText(this.$refs.content.innerText);
        }
    }
}
</script>

<style scoped lang="scss">
.nbsp {
    cursor: default;
}

a {
    cursor: pointer;
}
</style>