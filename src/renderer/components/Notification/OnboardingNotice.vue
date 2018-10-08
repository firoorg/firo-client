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
        margin-right: emRhythm(5);
        margin-left: emRhythm(5);

        header {
            color: $color--comet-dark;
            font-style: italic;
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

            a,
            strong {
                @include font-medium();
                font-weight: normal;
                font-style: inherit;
                color: mix($color--comet-dark, $color--comet);
            }
            a {
                transition: color 0.25s ease-in-out;
                color: $color--comet-dark;

                &:hover,
                &:focus {
                    color: $color--dark;
                }
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
