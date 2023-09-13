<template>
  <div>
    <Popup>
      <div class="edit-label-popup">
        <div class="title">Edit Label</div>
        <div class="content">
          <InputFrame label="">
            <input ref="input" type="text" v-model="newLabel" @keydown.enter="save_" />
          </InputFrame>
        </div>

        <div class="buttons">
          <button @click="cancel" class="solid-button unrecommended">Cancel</button>
          <button @click="save_" class="solid-button recommended">Save</button>
        </div>
      </div>
    </Popup>
  </div>
</template>

<script setup lang="ts">
import Popup from './Popup.vue';
import InputFrame from './InputFrame.vue';
import {VueElement, onMounted, ref, Ref} from 'vue';

const input: Ref<VueElement> = ref(null);
onMounted(() => {
    input.value.focus();
});

const {label, cancel, save} = defineProps<{
    label: String,
    cancel: () => void,
    save: (label: string) => void,
}>();
const newLabel = ref(<string>label);

function save_() {
    save(newLabel.value);
}
</script>

<style lang="scss">
@import "renderer/styles/popup";

.edit-label-popup {
    @include popup();

    margin: var(--padding-base);
}
</style>