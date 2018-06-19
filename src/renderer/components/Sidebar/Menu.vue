<template>
    <nav class="menu">
        <ul>
            <li>
                <router-link :to="{ name: 'receive-zcoin' }">
                    <span>Receive Zcoin</span>
                </router-link>
            </li>
            <li>
                <router-link :to="{ name: 'send-zcoin' }" exact>
                    <span>Send Zcoin</span>
                </router-link>
            </li>
            <li class="has-divider">
                <router-link :to="{ name: 'mint-zerocoin' }" exact>
                    <span>Mint Zcoin</span>
                </router-link>
            </li>
            <li>
                <router-link :to="{ name: 'spend-zerocoin' }" exact>
                    <span>Spend Privately</span>
                </router-link>
            </li>
            <li class="has-divider">
                <router-link :to="{ name: 'settings' }" exact>
                    <span>Settings</span>
                </router-link>
            </li>
        </ul>
    </nav>
</template>

<script>
  import AttentionBadge from '@/components/Badge/AttentionBadge'

  export default {
      name: 'Menu',
      components: {
          AttentionBadge
      }
  }
</script>

<style lang="scss" scoped>
    .menu {
        //margin-top: emRhythm(0.41);
        //@include sassline(zeta, $bodytype, 2, 2, all);
        border: none;
        text-align: left;
    }

    ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    li {
        padding-left: emRhythm(4);
        padding-right: emRhythm(4);

        &.has-divider {
            border: 0px solid $color--comet-dark;
            @include rhythmBorderTop(1px, 2);
            margin-top: emRhythm(2);
        }
    }

    a {
        display: block;
        position: relative;
        //border: 1px solid red;
        @include setType(5);
        margin: 0 0 emRhythm(1);
        border-radius: 0.25rem;
        color: $color--white-light;
        text-decoration: none;
        @include bleed-h(1);
        transition: padding .15s ease-out, margin .15s ease-out;

        &:after {
            position: absolute;
            content: '';
            display: block;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            background: $gradient--polo-vertical;
            opacity: 0;
            transition: opacity 0.15s ease-out;

        }

        span {
            position: relative;
            z-index: 2;
        }


        &:hover,
        &:focus {
            &:after {
                opacity: .15;
            }
        }

        &.router-link-active {
            @include bleed-h(2);
            //padding-left: emRhythm(2);
            &:after {
                opacity: .3;
            }
        }
    }
</style>