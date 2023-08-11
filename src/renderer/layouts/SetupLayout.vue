<template>
    <div class="setup-layout">
        <div class="logo">
            <FiroLogoDark class="logo-dark" />
            <FiroLogoWhite class="logo-white" />
        </div>

        <router-view class="setup-child" />
    </div>
</template>

<script>
import FiroLogoWhite from 'renderer/assets/FiroLogoWhite.vue';
import FiroLogoDark from 'renderer/assets/FiroLogoDark.vue';

export default {
    name: "SetupLayout",

    components: {
        FiroLogoDark,
        FiroLogoWhite
    }
}
</script>

<style scoped lang="scss">
.setup-layout {
    position: fixed;
    background-color: var(--color-background-detail);
    height: 100vh;
    width: 100vw;
    user-select: none;

    .logo {
        width: fit-content;
        margin: {
            left: auto;
            right: auto;
            top: var(--padding-base);
        };

        svg {
            height: 160px;
        }

        .logo-dark {
            display: block;

            @at-root #app.dark-color-theme & {
                display: none;
            }

            @media(prefers-color-scheme: dark) {
                @at-root #app:not(.light-color-theme) & {
                    display: none;
                }
            }
        }

        .logo-white {
            display: none;

            @at-root #app.dark-color-theme & {
                display: block;
            }

            @media(prefers-color-scheme: dark) {
                @at-root #app:not(.light-color-theme) & {
                    display: block;
                }
            }
        }
    }

    .setup-child {
        background-color: var(--color-background-main);
        padding: var(--padding-base);
        border-radius: var(--padding-base);
        max-width: 90%;
        width: fit-content;
        margin: {
            top: var(--padding-base);
            left: auto;
            right: auto;
        };
        box-shadow: 0 2px 6px rgba(60, 57, 57, 0.08)
    }
}
</style>
