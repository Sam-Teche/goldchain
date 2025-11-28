import {EmailRepository} from "../../domain/notification/repository";
import {EmailParameters, EmailType} from "../../domain/notification/email";
import {SMTPCredentials} from "../../../package/configs/environment";
import * as nodemailer from 'nodemailer';

class SMTPClass implements EmailRepository {
    smtpCredential: SMTPCredentials;
    transporter: nodemailer.Transporter;

    constructor(smtpCredential: SMTPCredentials) {
        this.smtpCredential = smtpCredential;

        this.transporter = nodemailer.createTransport({
            host: this.smtpCredential.host,
            port: this.smtpCredential.port,
            secure: this.smtpCredential.port === 465,
            auth: {
                user: this.smtpCredential.username,
                pass: this.smtpCredential.password,
            },
        });
    }

    async send(email: EmailParameters): Promise<void> {
        try {
            const mailOptions: nodemailer.SendMailOptions = {
                from: this.smtpCredential.fromAddress,
                to: email.email,
                subject: email.subject,
            };

            if (email.type === EmailType.HTML) {
                mailOptions.html = email.message;
            } else {
                mailOptions.text = email.message;
            }

            await this.transporter.sendMail(mailOptions);

            return Promise.resolve();
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }

    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('SMTP connection verified successfully');
            return true;
        } catch (error) {
            console.error('SMTP connection verification failed:', error);
            return false;
        }
    }
}

export default SMTPClass;