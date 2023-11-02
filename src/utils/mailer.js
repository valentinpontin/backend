import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, body) => {
    try {
        const mailConfig = {
            service: process.env.EMAIL_SERVICE,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        };
        const transport = nodemailer.createTransport(mailConfig);        
        await transport.sendMail(
            {
                from: `Flowery 4107 <${process.env.EMAIL_USER}>`,
                to: to,
                subject: subject,
                html: body
            });
    } catch (error) {
        throw new Error(`Failed to send email: ${error.message}`);
    }
};