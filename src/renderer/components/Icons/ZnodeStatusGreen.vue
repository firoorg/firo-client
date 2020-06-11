<template>
  <svg
    id="Layer_1"
    data-name="Layer 1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 15 15"
  >
    <circle class="cls-1" cx="10" cy="8" r="3" />
  </svg>
</template>

<script>
import IconColorMixin from "@/mixins/IconColorMixin";

export default {
  name: "ZnodeStatusGreen",
  mixins: [IconColorMixin],
};
</script>

<style scoped>
.cls-1 {
  fill: #32CD32;
}
</style>
