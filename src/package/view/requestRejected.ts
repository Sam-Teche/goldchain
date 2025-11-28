const requestRejectedHtml = (
    fromCompanyName: string,
    toName: string,
    listedPrice: string,
    url: string,
    supportMail: string
): string => {
    return `
    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GoldChain Verification</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet">

    <style>
        body {
            margin: 0;
            padding: 5rem 0;
            background-color: #0d0d0d !important;
            font-family: "Nunito", Arial, sans-serif;
            color: #ffffff !important;
        }

        .email-container {
            width: 100%;
            max-width: 500px;
            margin: 0 auto;
            background-color: #0d0d0d !important;
            padding: 40px 20px 20px 20px;
            border-radius: 8px;
        }

        .logo-container {
            padding-bottom: 20px;
            text-align: left;
        }

        .logo-img {
            width: 120px;
            height: auto;
        }

        .content-section {
            padding: 10px 20px;
            font-size: 13px;
            line-height: 18px;
            color: #cccccc;
        }

        .content-section p {
            margin: 0px 0;
        }

        .support-link {
            color: #9C7E00 !important;
            text-decoration: none;
        }

        .support-link:hover {
            text-decoration: underline;
        }

        .signature {
            margin-top: 20px;
            color: #aaaaaa !important;
        }

        .button-row {
            text-align: center;
            margin: 36px 0 24px 0;
        }

        .main-btn {
            background: #9C7E00;
            color: #fff !important;
            text-decoration: none;
            font-weight: 700;
            font-size: 16px;
            padding: 10px 0px;
            width: 100%;
            max-width: 350px;
            border-radius: 8px;
            display: inline-block;
            letter-spacing: 1px;
            box-shadow: 0 2px 12px 0 #00000038;
        }

        /* Footer Styling */
        .footer-section {
            background-color: #262626 !important;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #888888 !important;
            border-radius:8px;
            margin-top: 20px;
        }

        .footer-section a {
            color: #9C7E00 !important;
            text-decoration: none;
            margin: 0 5px;
        }

        .footer-section a:hover {
            text-decoration: underline;
        }

        .footer-section .separator {
            color: #888888 !important;
        }

        /* Responsive adjustments */
        @media screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                padding: 15px !important;
                border-radius: 0;
            }

            .content-section {
                padding: 18px;
            }

            .code-block {
                font-size: 28px;
                padding: 20px 10px;
                max-width: 90%;
            }
        }
    </style>
</head>

<body>
    <table role="presentation" class="email-container">
        <tr>
            <td>
                <div class="logo-container">
                    <img src="https://goldchain-test-files.s3.us-east-1.amazonaws.com/Group+242.png" alt="Group-242">
                </div>

                <div class="content-section">
                    <p>Hi ${toName}</p>
                    <br />
                    <p>Unfortunately, your offer of ${listedPrice} has been rejected by ${fromCompanyName}. You can submit a new offer now..</p>
                </div>

                <div class="button-row">
                    <a href="${url}" class="main-btn">SEND NEW OFFER</a>
                </div>

                <div class="content-section">
                    <p>Thank you for trusting GoldChain for your gold sourcing.</p>
                    <br />
                    <p>

                        If you have any questions, feel free to contact us at <a href="mailto:support@goldchainblock.io" class="support-link">${supportMail}</a>.</p>
                    <p><br />
<p>—</p>
                        GoldChain Support</p>
                </div>

            </td>
        </tr>
        <tr>
            <td>
                <div class="footer-section">
                    <a href="#" target="_blank">Unsubscribe</a>
                    <span class="separator">|</span>
                    <a href="#" target="_blank">Privacy Policy</a>
                    <span class="separator">|</span>
                    <a href="#" target="_blank">Contact Support</a>
                    <p style="margin-top: 15px; margin-bottom: 0;">&copy; 2025 GoldChain LLC</p>
                </div>
            </td>
        </tr>
    </table>
</body>

</html>
`
}

export default requestRejectedHtml