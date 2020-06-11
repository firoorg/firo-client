<template>
  <svg
    id="Layer_1"
    data-name="Layer 1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -17 45 45"
  >
    <defs>
      <svg:style>
        .cls-1 {
          fill: #373850;
        }
      </svg:style>
    </defs>
    <path class="cls-1" d="M10,0h0L20,10v1.42H18.57L10,2.89,1.43,11.46H0V10Z" />
  </svg>
</template>

<script>
import IconColorMixin from "@/mixins/IconColorMixin";

export default {
  name: "ZnodeCollapseButton",
  mixins: [IconColorMixin],
};
</script>

<style scoped>
.cls-1 {
  fill: #373850;
}
</style>
