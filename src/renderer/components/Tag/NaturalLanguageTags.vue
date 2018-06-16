<template>
    <span :class="{ interactive: hasTagClick }">
        <span v-for="(word, index) in parsedContent" class="word">
            <a v-if="word.type === 'tag'" @click="() => onClick(word.content)">
                <el-tag :size="tagSize" class="tag">{{ word.content }}</el-tag>
            </a>
            <span v-else>{{ word.content }}</span>
        </span>
    </span>
</template>

<script>
  export default {
      name: 'natural-language-tags',
      props: {
          content: {
              required: true,
              type: String,
              default: ''
          },
          tagSize: {
              type: String,
              default: 'medium'
          },
          onTagClick: {
              required: false,
              type: Function
          }
      },

      computed: {
          parsedContent () {
              // todo proper hashtag extraction -> http://geekcoder.org/js-extract-hashtags-from-text/
              return this.content.split(' ').map((content) => {
                  // tags = #+char(:not(number))
                  const isTag = (content.charAt(0) === '#' && isNaN(parseInt(content.charAt(1))))

                  return {
                      type: isTag ? 'tag' : 'word',
                      content: isTag ? content.substr(1) : content
                  }
              })
          },

          hasTagClick () {
              return this.onTagClick !== undefined
          },

          onClick () {
              return this.onTagClick || function () {}
          }
      }
  }
</script>

<style lang="scss" scoped>
    @import '../../styles';

    .word {
        &:before,
        &:after {
            content: ' '
        }

        &:first-child:before,
        &:last-child:after {
            content: ''
        }

    }

    .interactive .tag {
        border: none;
        background: transparent;
        border-bottom: emRhythm(0.5, $silent: true) solid $color--polo;
        color: inherit;
        transition: background-color 0.15s ease-in, border-color 0.15s ease-in;
        cursor: pointer;

        &:hover {
            background: rgba($color--polo, 0.5);
            border-color: $color--polo-dark;
        }
    }
</style>