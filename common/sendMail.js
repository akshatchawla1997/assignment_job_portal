const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: "akshatchawla1997@gmail.com",
    pass: "utyp ujwg ipis qxgp",
  },
});

const sendMailToUser = async (userId, data) => {
  console.log(data);

  const mailOptions = {
    from: 'akshatchawla1997@gmail.com',
    to: userId,
    subject: 'Welcome to GRFC',
    html: data.message,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error occurred while sending email:', error);
        return reject({
          status: 500,
          success: false,
          message: 'Failed to send email',
          error,
        });
      } else {
        console.log('Email sent successfully:', info.response);
        return resolve({
          status: 200,
          success: true,
          message: 'Email sent successfully',
          info,
        });
      }
    });
  });
};

module.exports = {
  sendMailToUser,
};
