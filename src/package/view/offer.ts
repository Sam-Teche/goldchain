const offerHtml = (toName: string, listingId: string, offer: string, listedPrice: string, fromName: string, url: string, expiry: string): string => {
    return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GoldChain Order Request</title>
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
            text-align: left;
            padding-bottom: 20px;
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

        .order-details {
            margin: 25px 0 25px 0;
            padding: 18px 20px;
            border-radius: 8px;
        }

        .details-table {
            width: 100%;
            border-collapse: collapse;
            border-spacing: 0;
        }

        .details-table td {
            padding: 4px 0;
            vertical-align: top;
        }

        .details-label {
            color: #666666 !important;
            font-weight: 700;
            font-size: 12px;
            letter-spacing: 0;
            width: 100px;
        }

        .details-value {
            color: #fff;
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 0;
            line-height: 100%;
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

        .support {
            color: #aaaaaa;
            font-size: 13px;
            padding: 8px 20px 0 20px;
        }

        /* Footer Styling */
        .footer-section {
            background-color: #262626 !important;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #888888 !important;
            border-radius: 8px 8px 8px 8px;
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

        @media screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                padding: 15px !important;
                border-radius: 0;
            }

            .content-section {
                padding: 10px;
            }

            .order-details {
                padding: 12px 10px;
            }

            .button-row {
                margin: 26px 0 14px 0;
            }

            .footer-section {
                border-radius: 8px;
            }
        }
    </style>
</head>

<body>
    <table role="presentation" class="email-container">
        <tr>
            <td>
                <div class="logo-container">
                    <img src="https://goldchain-test-files.s3.us-east-1.amazonaws.com/Group+242.png" alt="GoldChain Logo" class="logo-img">
                </div>

                <div class="content-section">
                    Hi ${toName},
                </div>

                <div class="content-section">
                    You received a new offer:
                </div>


                <div class="order-details">
                    <table class="details-table">
                        <tr>
                            <td class="details-label">LISTING ID</td>
                            <td class="details-value">${listingId}</td>
                        </tr>
                        <tr>
                            <td class="details-label">LISTED PRICE</td>
                            <td class="details-value">$${listedPrice}</td>
                        </tr>
                        <tr>
                            <td class="details-label">OFFER PRICE</td>
                            <td class="details-value">$${offer}</td>
                        </tr>
                        <tr>
                            <td class="details-label">BUYER</td>
                            <td class="details-value">${fromName}</td>
                        </tr>
                    </table>
                </div>

                <div class="content-section">
                    Please review and accept, decline, or counter the offer within ${expiry}.
                </div>

                <div class="button-row">
                    <a href="${url}" class="main-btn">REVIEW OFFER</a>
                </div>

                <div class="content-section">
                    <p>—</p>
                    GoldChain Support
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

</html> `
}

export default offerHtml