const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');


module.exports = class Email {
    constructor(user, url) {
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = process.env.SENDGRID_FROM;
        this.to = user.email
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            //sendgrid
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD,

                }, 
                secure: false, // use SSL
                tls: {
                    rejectUnauthorized: false
                }
            });
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,


            auth: {

                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
            //activate in gmail "less secure app"
            //not a good idea to use gmail in production apps, this is because there is a limit of 500 emails per day
            // and u could be marked as a spammer easily... we use sendgrid and mailgun or mailtrap
        });
    }

    async send(template, subject) {
        //1- render the HTML based on pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        //2-define the email options 
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html),
        };

        //3- create a transport and send email
        await this.newTransport().sendMail(mailOptions);

    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)');
    }


};

// const sendEmail = async options => {
//     //1- create a transporter 

//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {

//             user: process.env.EMAIL_USERNAME,
//             pass: process.env.EMAIL_PASSWORD
//         }
//         //activate in gmail "less secure app"
//         //not a good idea to use gmail in production apps, this is because there is a limit of 500 emails per day
//         // and u could be marked as a spammer easily... we use sendgrid and mailgun or mailtrap
//     });
//     //2- define the email options

//     const mailOptions = {
//         from: 'Gasser Aly <hello@jonas.io>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message,
//     };
//     //3- send the email with nodemailer

//     await transporter.sendMail(mailOptions);

// };
// module.exports = sendEmail;