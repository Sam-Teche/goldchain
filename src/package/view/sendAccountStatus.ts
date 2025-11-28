const accountStatusChangeHtml = (
    status: "pending" | "approved" | "rejected" | "banned",
    supportMail: string,
): string => {
    const statusDetails: Record<string, { title: string; message: string; color: string }> = {
        pending: {
            title: "Account Under Review",
            message:
                "Your account status is now <b>Pending</b>. Our team is currently reviewing your details. You will be notified once a decision is made.",
            color: "#e4c859"
        },
        approved: {
            title: "Account Approved!",
            message:
                "Congratulations! Your account has been <b>Approved</b> and is now fully active. You can log in and start using all features.",
            color: "#26c281"
        },
        rejected: {
            title: "Account Rejected",
            message:
                "We're sorry to inform you that your account has been <b>Rejected</b>. For more information, or if you believe this was a mistake, please contact our support team.",
            color: "#ff6363"
        },
        banned: {
            title: "Account Banned",
            message:
                "Your account has been <b>Banned</b> due to a violation of our terms. If you have any questions or wish to appeal, reach out to our support team.",
            color: "#e74c3c"
        }
    };

    const { title, message, color } = statusDetails[status];

    return `
  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GoldChain Account Status Update</title>
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
        padding-bottom: 18px;
      }
      .logo-img {
        width: 120px;
        height: auto;
      }
      .content-section {
        padding: 10px 20px;
        font-size: 14px;
        line-height: 1.6;
        color: #cccccc;
      }
      .content-section p {
        margin: 10px 0;
      }
      .status-block {
        background-color: ${color};
        color: #0d0d0d !important;
        font-size: 26px;
        font-weight: bold;
        text-align: center;
        padding: 24px 15px;
        border-radius: 8px;
        margin: 30px auto;
        letter-spacing: 1px;
        max-width: 340px;
      }
      .support-link {
        color: #9C7E00 !important;
        text-decoration: none;
      }
      .support-link:hover {
        text-decoration: underline;
      }
      .signature {
        margin-top: 18px;
        color: #aaaaaa !important;
      }
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
      @media screen and (max-width: 600px) {
        .email-container {
          width: 100% !important;
          padding: 15px !important;
          border-radius: 0;
        }
        .content-section {
          padding: 10px;
        }
        .status-block {
          font-size: 19px;
          padding: 18px 8px;
          max-width: 95%;
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
            <img src="https://goldchain-test-files.s3.us-east-1.amazonaws.com/Group+242.png" alt="GoldChain Logo" class="logo-img" />
          </div>
          <div class="content-section">
            <p style="font-size:16px; color:#fff;">
               Hello,
            </p>
            <div class="status-block">
              ${title}
            </div>
            <p style="margin-top: 18px;">
              ${message}
            </p>
            <p style="color:#fff;">
              If you have any questions, please contact our support team at <a href="mailto:${supportMail}" class="support-link">${supportMail}</a>.
            </p>
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
  `;
};

export default accountStatusChangeHtml;
