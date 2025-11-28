const forgotPasswordEmailHtml = (url: string, supportMail: string): string => {
    return `
   <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reset your password</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
    }
    body {
      margin: 0;
      padding: 0 20px;
      background: #F7F8FA !important;
      font-family: 'Inter', 'Segoe UI', 'Roboto', Arial, sans-serif;
      color: #1C1C1E;
      letter-spacing: 0.01em;
    }
    .card {
      max-width: 410px;
      margin: 44px auto;
      background: #fff;
      border-radius: 16px;
      box-shadow: none;
      overflow: hidden;
      border: 1px solid #f1f1f1;
      padding: 0 10px;
    }
    .gold-bar {
      height: 4px;
      width: 100%;
      background: linear-gradient(90deg, #D4AF37, #f7e7ba);
      border-radius: 0 0 6px 6px;
      margin-bottom: 18px;
    }
    .icon-lock {
      width: 48px;
      height: 48px;
      margin: 32px auto 0 auto;
      display: block;
      color: #0C2D5B;
    }
    .card h2 {
      margin: 20px 0 8px 0;
      text-align: center;
      color: #0C2D5B;
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: 0.01em;
    }
    .card p {
      margin: 0 0 20px 0;
      text-align: center;
      color: #1C1C1E;
      font-size: 1.06rem;
      line-height: 1.55;
      font-weight: 400;
    }
    .button {
      display: block;
      width: fit-content;
      margin: 0 auto 28px auto;
      padding: 12px 32px;
      background: #0C2D5B;
      color: #fff !important;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
      font-size: 1.05rem;
      border: none;
      transition: background 0.15s;
      box-shadow: none;
    }
    .button:hover {
      background: #10294a !important;
    }
    .flair {
      width: 18px;
      height: 4px;
      background: #D4AF37;
      border-radius: 2px;
      margin: 0 auto 20px auto;
    }
    .footer {
      padding: 18px 0 12px 0;
      text-align: center;
      background: #F7F8FA;
      font-size: 0.97rem;
      color: #1C1C1E;
      border-top: 1px solid #f1f1f1;
    }
    .footer a {
      color: #0C2D5B;
      text-decoration: underline;
      margin-left: 3px;
    }
    @media only screen and (max-width: 520px) {
      .card { max-width: 97vw; margin: 16px auto; }
      .card h2 { font-size: 1.18rem; }
      .icon-email { width: 42px; height: 42px; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="gold-bar"></div>
    <svg class="icon-lock" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="21" width="24" height="15" rx="5" fill="#F7F8FA" stroke="#D4AF37" stroke-width="2"/>
      <path d="M24 29v3" stroke="#0C2D5B" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="24" cy="27" r="2.2" fill="#0C2D5B"/>
      <rect x="16" y="16" width="16" height="9" rx="5" stroke="#0C2D5B" stroke-width="2" fill="none"/>
    </svg>
    <div class="flair"></div>
    <h2>Reset your password</h2>
    <p>
     Hi,<br>
      We received a request to reset your password for your <b>leasestash</b> account.<br>
      Click the button below to set a new password.<br>
      <br>
      <span style="font-size:0.99rem;color:#7d7d7e;">If you didn't request this, please ignore this email.</span>
    </p>
    <a href="${url}" class="button">Verify my account</a>
  </div>
  <div class="footer">
    <span>Need help?</span>
    <a href="mailto:${supportMail}">Contact Support</a>
    <div style="color:#A6A6A8; margin-top:10px;">&copy; 2025 leasestash</div>
  </div>
</body>
</html>
 `
}

export default forgotPasswordEmailHtml;