const verifyEmailHtml = (otp: string, supportMail: string): string => {
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
             font-size: 36px;
             font-weight: bold;
             text-align: center;
             padding: 25px 15px;
             border-radius: 8px;
             margin: 30px auto;
             letter-spacing: 2px;
             max-width: 300px;
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
                 font-size: 28px;
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
                    <img src="https://goldchain-test-files.s3.us-east-1.amazonaws.com/Group+242.png" alt="Group-242">
                 </div>

                 <div class="content-section">
                     <p>Here is your 6-digit code to reset your GoldChain password:</p>
                 </div>

                 <div class="code-block">
                     ${otp}
                 </div>
                 
                 <div class="content-section">
                     <p>This code will expire in 10 minutes. If you didn't attempt to create an account, please ignore this message.</p>
                     <p>Having trouble? Reach out to us at <a href="mailto:support@goldchainblock.io" class="support-link">${supportMail}</a>.</p>
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

export default verifyEmailHtml;