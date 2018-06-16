<template>
    <div>
        <table role="presentation" style="max-width: 680px;" class="email-container" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
            <!-- Hero Image, Flush : BEGIN -->
            <tbody><tr>
                <td bgcolor="#ffffff" align="center">
                    <img alt="Zcoin Logo" width="128" height="128" style="width: 100%; max-width: 128px; height: auto; background: #ffffff; font-family: sans-serif; font-size: 15px; line-height: 140%; color: #dddddd; margin: auto;" class="g-img" border="0" align="middle" src="data:image/jpeg;base64,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">
                    <!--<img src="http://placehold.it/1360x600" alt="alt_text" style="width: 100%; max-width: 680px; height: auto; background: #dddddd; font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555; margin: auto;" class="fluid g-img" width="680" height="" border="0" align="middle">-->
                </td>
            </tr>
            <!-- Hero Image, Flush : END -->

            <!-- 1 Column Text + Button : BEGIN -->
            <tr>
                <td bgcolor="#ffffff">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tbody><tr>
                            <td style="padding: 40px 40px 20px; text-align: center;">
                                <h1 style="margin: 0; font-family: sans-serif; font-size: 24px; line-height: 125%; color: #333333; font-weight: normal;">Zcoin Payment Request</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 40px 40px; font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555; text-align: center;">
                                <p style="margin: 0;">Maecenas sed ante pellentesque, posuere leo id, eleifend dolor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent laoreet malesuada cursus. Maecenas scelerisque congue eros eu posuere. Praesent in felis ut velit pretium lobortis rhoncus ut&nbsp;erat.</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 40px 40px; font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555;">
                                <!-- Button : BEGIN -->
                                <table role="presentation" style="margin: auto;" cellspacing="0" cellpadding="0" border="0" align="center">
                                    <tbody><tr>
                                        <td style="border-radius: 3px; background: #222222; text-align: center;" class="button-td">
                                            <a href="zcoin://foo.bar" style="background: #222222; border: 15px solid #222222; font-family: sans-serif; font-size: 13px; line-height: 110%; text-align: center; text-decoration: none; display: block; border-radius: 3px; font-weight: bold;" class="button-a">
                                                <span style="color:#ffffff;" class="button-link">&nbsp;&nbsp;&nbsp;&nbsp;Open Payment Request&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                            </a>
                                        </td>
                                    </tr>
                                    </tbody></table>
                                <!-- Button : END -->
                            </td>
                        </tr>

                        </tbody></table>
                </td>
            </tr>
            <!-- 1 Column Text + Button : END -->

            <!-- Thumbnail Right, Text Left : BEGIN -->
            <tr>
                <!-- dir=rtl is where the magic happens. This can be changed to dir=ltr to swap the alignment on wide while maintaining stack order on narrow. -->
                <td dir="rtl" style="padding: 10px 0;" valign="top" width="100%" height="100%" bgcolor="#ffffff" align="center">
                    <!--[if mso]>
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" width="660" style="width: 660px;">
                        <tr>
                            <td align="center" valign="top" width="660">
                    <![endif]-->
                    <table role="presentation" style="max-width:660px;" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
                        <tbody><tr>
                            <td style="font-size:0; padding: 10px 0;" valign="top" align="center">
                                <!--[if mso]>
                                <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" width="660" style="width: 660px;">
                                    <tr>
                                        <td align="left" valign="top" width="220" style="width: 220px;">
                                <![endif]-->
                                <div style="display:inline-block; margin: 0 -2px; max-width: 200px; min-width:160px; vertical-align:top; width:100%;" class="stack-column">
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                        <tbody><tr>
                                            <td dir="ltr" style="padding: 0 10px 10px 10px;">
                                                <slot name="qrcode">
                                                    <img src="http://placehold.it/200" alt="alt_text" class="center-on-narrow" style="width: 100%; max-width: 200px; height: auto; background: #dddddd; font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555;" width="200" height="" border="0">
                                                </slot>
                                            </td>
                                        </tr>
                                        </tbody></table>
                                </div>
                                <!--[if mso]>
                                </td>
                                <td align="left" valign="top" width="440" style="width: 440px;">
                                <![endif]-->
                                <div style="display:inline-block; margin: 0 -2px; max-width:66.66%; min-width:320px; vertical-align:top;" class="stack-column">
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                        <tbody><tr>
                                            <td dir="ltr" style="font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555; padding: 10px 10px 0; text-align: left;" class="center-on-narrow">
                                                <h2 style="margin: 0 0 10px 0; font-family: sans-serif; font-size: 18px; line-height: 125%; color: #333333; font-weight: bold;">Class aptent taciti sociosqu</h2>
                                                <p style="margin: 0 0 10px 0;">Maecenas sed ante pellentesque, posuere leo id, eleifend dolor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                                                <!-- Button : BEGIN -->
                                                <table role="presentation" class="center-on-narrow" style="float:left;" cellspacing="0" cellpadding="0" border="0">
                                                    <tbody><tr>
                                                        <td style="border-radius: 3px; background: #222222; text-align: center;" class="button-td">
                                                            <a href="http://www.google.com" style="background: #222222; border: 15px solid #222222; font-family: sans-serif; font-size: 13px; line-height: 110%; text-align: center; text-decoration: none; display: block; border-radius: 3px; font-weight: bold;" class="button-a">
                                                                <span style="color:#ffffff;" class="button-link">&nbsp;&nbsp;&nbsp;&nbsp;A Button&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                                            </a>
                                                        </td>
                                                    </tr>
                                                    </tbody></table>
                                                <!-- Button : END -->
                                            </td>
                                        </tr>
                                        </tbody></table>
                                </div>
                                <!--[if mso]>
                                </td>
                                </tr>
                                </table>
                                <![endif]-->
                            </td>
                        </tr>
                        </tbody></table>
                    <!--[if mso]>
                    </td>
                    </tr>
                    </table>
                    <![endif]-->
                </td>
            </tr>
            <!-- Thumbnail Right, Text Left : END -->

            </tbody></table>
    </div>
</template>

<script>
  export default {
      name: 'receive-payment-request-email-template',
      props: [
          'message',
          'address',
          'amount',
          'uri'
      ]
  }
</script>