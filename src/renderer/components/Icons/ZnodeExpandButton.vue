<template>
  <svg
    id="Layer_1"
    data-name="Layer 1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -17 45 45"
  >
    <path
      class="cls-1"
      d="M10,11.46h0L0,1.46V0H1.43L10,8.61,18.57,0H20V1.46Z"
    />
  </svg>
</template>

<script>
import IconColorMixin from "@/mixins/IconColorMixin";

export default {
  name: "ZnodeExpandButton",
  mixins: [IconColorMixin],
};
</script>

<style scoped>
.cls-1 {
  fill: #373850;
}
</style>
