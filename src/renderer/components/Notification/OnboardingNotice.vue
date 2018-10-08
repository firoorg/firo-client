<template>
    <section class="onboarding notice">
        <header>
            <slot name="header" />
        </header>

        <main>
            <slot name="content" />
        </main>
    </section>
</template>

<script>
    export default {
        name: 'OnboardingNotice'
    }
</script>

<style lang="scss" scoped>
    .onboarding {
        margin: 0  emRhythm(5);

        header {
            h1, h2, h3 {
                &:first-child {
                    margin-top: 0;
                }
            }
        }

        main {
            color: $color--comet;
            -webkit-font-smoothing: subpixel-antialiased;

            p:last-child {
                margin-bottom: 0;
            }

            strong {
                @include font-medium();
                font-weight: normal;
                font-style: inherit;
                color: mix($color--comet-dark, $color--comet);
            }
        }
        &.notice {
            background: mix($color--polo-light, $color--white);
            padding: emRhythm(4);
            //@include box-shadow-large($color--polo-medium);
            @include glow-huge-box($color--polo-medium);

            main {
                @include lato-font('regular');
                font-style: italic;
            }
        }
    }
</style>
