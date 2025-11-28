const adminWelcomeEmailHtml = (password: string, supportMail: string): string => {
    return `
    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GoldChain Admin Access</title>
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
        }

        .logo-img {
            width: 120px;
            height: auto;
        }

        .content-section {
            padding: 10px 20px;
            font-size: 14px;
            line-height: 1.2;
            color: #cccccc;
        }

        .content-section p {
            margin: 10px 0;
        }

        .code-block {
            background-color: #333333 !important;
            color: #ffffff !important;
            font-size: 28px;
            font-weight: bold;
            text-align: center;
            padding: 25px 15px;
            border-radius: 8px;
            margin: 30px auto;
            letter-spacing: 2px;
            max-width: 300px;
            word-break: break-all;
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

        /* Footer Styling */
        .footer-section {
            background-color: #262626 !important;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #888888 !important;
            border-radius: 0 0 8px 8px;
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
                padding: 10px;
            }

            .code-block {
                font-size: 22px;
                padding: 20px 10px;
                max-width: 90%;
            }

            .logo-container {
                padding-bottom: 20px;
            }

            .footer-section {
                border-radius: 0;
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
                    <h2 style="color: #9C7E00 !important; margin-bottom: 10px;">Welcome to GoldChain Admin!</h2>
                    <p>You have been added as an <strong>Admin</strong> on the GoldChain platform.</p>
                    <p>Please use the password below to log in for the first time. For your security, we recommend changing this password after your first login.</p>
                </div>

                <div class="code-block">
                    ${password}
                </div>

                <div class="content-section">
                    <p>If you have any issues or did not expect this email, please contact us at <a href="mailto:${supportMail}" class="support-link">${supportMail}</a>.</p>
                    <p>Welcome aboard!</p>
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

export default adminWelcomeEmailHtml;
