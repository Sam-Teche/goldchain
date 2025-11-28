const emailVerifiedHTML = (name: string, url: string, supportMail: string) => {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Email Verified</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0 20px;
      background: #F7F8FA;
      font-family: 'Inter', 'Segoe UI', 'Roboto', Arial, sans-serif;
      color: #1C1C1E;
      letter-spacing: 0.01em;
    }
    .card {
      max-width: 410px;
      margin: 44px auto;
      background: #fff;
      border-radius: 16px;
      box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
      overflow: hidden;
      /*border: 1px solid #000000;*/
    }
    .gold-bar {
      height: 4px;
      width: 100%;
      background: linear-gradient(90deg, #D4AF37, #f7e7ba);
      border-radius: 0 0 6px 6px;
      margin-bottom: 18px;
    }
    .icon-verified {
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
      color: #fff;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
      font-size: 1.05rem;
      border: none;
      transition: background 0.15s;
      box-shadow: none;
    }
    .button:hover {
      background: #10294a;
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
      border-top: 1px solid #ffffff;
    }
    .footer a {
      color: #0C2D5B;
      text-decoration: underline;
      margin-left: 3px;
    }
    @media only screen and (max-width: 520px) {
      .card { max-width: 97vw; margin: 16px auto; }
      .card h2 { font-size: 1.18rem; }
      .icon-verified { width: 42px; height: 42px; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="gold-bar"></div>
    <svg class="icon-verified" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" fill="#F7F8FA" stroke="#D4AF37" stroke-width="2.2"/>
      <path d="M17.5 24.7l5 5.1 8-9.5" stroke="#0C2D5B" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>
    <div class="flair"></div>
    <h2>Email Verified</h2>
    <p>Hi <b>${name}</b>,<br>
      Your email address is now <span style="color:#D4AF37;font-weight:500;">verified</span>.<br>
      You’re all set to enjoy the full experience.
    </p>
    <a href="${url}" class="button">Go to Dashboard</a>
  </div>
  <div class="footer">
    <span>Questions?</span>
    <a href="mailto:${supportMail}">Contact Support</a>
    <div style="color:#A6A6A8; margin-top:10px;">&copy; 2025 leasestash</div>
  </div>
</body>
</html>
    `
}

export default emailVerifiedHTML;