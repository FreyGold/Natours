const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.name = user.name;
    this.url = url;
    this.from = 'Ahmed Tawfik <admin@trial-o65qngkv1xolwr12.mlsender.net>';
  }
  newTransporter() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: process.env.SENDER_HOST,
        port: process.env.SENDER_PORT,
        auth: {
          user: process.env.SENDER_USERNAME,
          pass: process.env.SENDER_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: 'live.smtp.mailtrap.io',
      port: 587,
      auth: {
        user: 'api',
        pass: '13ae010d5cd78f0a603164173f3f8579',
      },
      //
    });
  }
  async send(template, subject) {
    //send the actual email
    //1 Pug

    //// define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: `${template}`,
    };

    //// create transporter and send mail
    await this.newTransporter().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('you are now signed up!', 'Welcome to Natours Family!');
  }

  async sendPasswordReset(Url) {
    await this.send(
      `here is your reset token link ${Url}`,
      'Your Password Reset Token',
    );
  }
};
