<template>
    <span :class="{ interactive: hasTagClick }">
        <span
            v-for="(word, index) in parsedContent"
            :key="index"
            class="word"
        >
            <a
                v-if="word.type === 'tag'"
                @click="() => onClick(word.content)"
            >
                <base-tag
                    :size="tagSize"
                    class="tag"
                >
                    {{ word.content }}
                </base-tag>
            </a>
            <span v-else>
                {{ word.content }}
            </span>
        </span>
    </span>
</template>

<script>
export default {
    name: 'NaturalLanguageTags',
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
            type: Function,
            default: undefined
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
        background: transparent;
        // border-bottom: emRhythm(0.5, $silent: true) solid $color--polo;
        color: inherit;
        transition: background-color 0.15s ease-in, border-color 0.15s ease-in;
        cursor: pointer;

        &:hover {
            background: rgba($color--polo, 0.5);
            border-color: $color--polo-dark;
        }
    }

    .tag {
        transition: border-color 0.15s ease-in;

        &.tag-medium {
            border-bottom: emRhythm(0.25, $silent: true) solid $color--polo;
        }

        &.tag-large {
            border-bottom: emRhythm(0.5, $silent: true) solid $color--polo;
        }
    }
</style>
