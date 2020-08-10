const nodemailer = require('nodemailer');
const sendEmail = async options => {
    //1- create a transporter 

    const transporter = nodemailer.createTransport({
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
    //2- define the email options

    const mailOptions = {
        from: 'Gasser Aly <hello@jonas.io>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    //3- send the email with nodemailer

    await transporter.sendMail(mailOptions);

};
module.exports = sendEmail;