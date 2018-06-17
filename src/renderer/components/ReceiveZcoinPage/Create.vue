<template>
    <transition name="slide-down" leave-active-class="slide-up-leave-active">
        <section class="create">
            <div class="form">
                <h2>
                    Create<br>
                    Payment Request
                </h2>

                <div class="field">
                    <label for="label">Title</label>
                    <div class="control">
                        <input v-model="createForm.label" type="text" id="label">
                    </div>
                </div>

                <div class="field amount-field">
                    <label for="amount">Amount</label>
                    <div class="control">
                        <input v-model="createForm.amount" type="text" id="amount" class="amount">
                        <div class="prefix">XZC</div>
                    </div>
                </div>

                <div class="field message-field">
                    <label for="message">Message</label>
                    <div class="control">
                        <base-textarea v-model="createForm.message" class="message" id="message" />
                    </div>
                </div>
            </div>

            <div class="create-wrap">
                <base-button color="green"
                             @click="submitForm"
                             class="submit">
                    Create Payment Request
                </base-button>
            </div>
            <!--<ActionButtons class="create-wrap">
                <el-button slot="secondary"
                           type="danger"
                           @click="() => this.$router.go(-1)"
                           plain>
                    Cancel
                </el-button>
                <el-button slot="primary"
                           icon="el-icon-plus"
                           type="primary"
                           @click="() => this.$router.push({ name: 'receive-zcoin' })">
                    New Payment Request test
                </el-button>
            </ActionButtons>-->
        </section>
    </transition>
</template>

<script>
  export default {
      name: 'createPaymentRequest',
      data () {
          return {
              buttonStep: 0,
              createForm: {
                  amount: null,
                  label: '',
                  message: ''
              }
          }
      },
      methods: {
          resetForm () {
              this.createForm = {
                  amount: null,
                  label: '',
                  message: ''
              }
          },
          submitForm () {
              console.log('submitting form')
          }
      }
  }
</script>

<style lang="scss" scoped>
    @import '../../styles';

    .create {
        display: grid;
        grid-template-rows: auto auto;

        min-height: 100%;
        padding: emRhythm(5);
        box-sizing: border-box;

        // background: $color--polo-medium;
        background: $color--comet-dark;
        // background: $gradient--comet-horizontal;
        color: $color--white;

        h2 {
            margin-left: emRhythm(3, $ms-up2);
            margin-bottom: emRhythm(7, $ms-up2);
        }
    }

    .form {
        $input-bleed: 2;

        ::selection {
            color: $color--dark;
            background: $color--white-light;
        }

        .field {
            margin-bottom: emRhythm(3);
            & > label {
                display: block;
                @include font-heavy();
                padding-bottom: emRhythm(1);
            }
        }


        .control {
            position: relative;

            input[type="text"],
            select,
            .message {
                position: relative;
                width: 100%;
                border: none;
                outline: none;
                background: rgba($color--dark, 0.4);
                color: $color--white-light;
                // box-sizing: border-box;

                transition: background 0.25s ease-out, background 0.15s ease-out;

                &:hover {
                    background: rgba($color--dark, 0.55);
                }

                &:focus {
                    background: rgba($color--dark, 0.7);
                    color: $color--white;
                }
            }

            input[type="text"] {
                @include setType(5);
            }

            input[type="text"],
            .message {
                @include bleed-h($input-bleed);
            }

            .prefix {
                position: absolute;
                top: 0;
                right: emRhythm($input-bleed) * -1;
                padding-right: emRhythm($input-bleed);
                height: 100%;
                @include setType(5);
                // opacity: 0.5;
                color: $color--comet;
                // user-select: none;
                pointer-events: none;
            }

            .message {
                padding: emRhythm(2);
                //box-sizing: border-box;
                @include setType(3);
            }
        }
    }

    .submit {
        width: 100%;
    }

    .create-wrap {
        align-self: self-end;
        position: relative;
        padding: emRhythm(5) emRhythm(3) 0;
    }
</style>