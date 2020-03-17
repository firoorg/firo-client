<template>
  <div>
      <ul id="navigation">
        <li v-for="item in navList" :key="item">
            <template v-if="item.children">
                <a 
                  :href="item.url" 
                  :title="item.name" 
                  @click="isOpen = !isOpen, active = !active" 
                  :class="{ active }">{{ item.name }} <svg viewBox="0 0 451.847 451.847" width="12"><path d="M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751
		c12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0
		c12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z" fill="#fff"/></svg></a>
                <div :class="{ isOpen }" class="dropdown">
                    <ul>
                        <li 
                          v-for="{ url, name, index, target } in item.children" 
                          :key="index">
                            <a :href="url" :title="name" :target="target">{{ name }}> </a>
                        </li>
                    </ul>
                </div>
            </template>
            <template v-else>
                <a 
                  :href="item.url" 
                  :title="item.name">{{ item.name }}</a>
            </template>
        </li>
    </ul>
  </div>
</template>
<script>
import { mixin as clickaway } from 'vue-clickaway';
export default {
  name: "DropDown",
  props: ["item"],
  data() {
    return {
      isOpen: false,
      active: false,
      navList: [
        { url: "#", name: "About Us" },
        { url: "#", name: "Story" },
        { url: "#", name: "Price" },
        {
          url: "#",
          name: "Services",
          children: [
            {
              url: "https://twitter.com/andrejsharapov",
              name: "Twitter",
              target: "_blank"
            },
            {
              url: "https://dribbble.com/andrejsharapov",
              name: "Dribbble",
              target: "_blank"
            },
            {
              url: "https://www.behance.net/andrejsharapov",
              name: "Behance",
              target: "_blank"
            },
            {
              url: "https://www.instagram.com/andrej.sharapov/",
              name: "Instagram",
              target: "_blank"
            }
          ]
        },
        { url: "#", name: "Testimonials" },
        { url: "#", name: "Contact Us" }
      ]
    };
  },
};
</script>
<style scoped>
</style>